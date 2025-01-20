require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.btlbb.mongodb.net/quiz?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB Atlas');
    await resetAndInitializeDatabase();
    console.log('Database initialization complete');
})
.catch(err => console.error('MongoDB connection error:', err));


app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI, 
        collectionName: 'sessions'
    })
}));

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
    category: { type: String, required: true },
    question: { type: String, required: true },
    options: [String],
    correct: { type: Number, required: true }
});

const Question = mongoose.model('Question', questionSchema);

async function resetAndInitializeDatabase() {
    try {
        console.log('Starting database reset and initialization...');
        
        const deleteResult = await Question.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing questions`);

        const quizData = {
            science: [
                {
                    question: "What is the chemical symbol for gold?",
                    options: ["Au", "Ag", "Fe", "Cu"],
                    correct: 0
                },
                {
                    question: "What planet is known as the Red Planet?",
                    options: ["Mars", "Venus", "Earth", "Jupiter"],
                    correct: 0
                },
                {
                    question: "What is the main gas found in the Earth's atmosphere?",
                    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                    correct: 2
                },
                {
                    question: "What is the process by which plants make their food?",
                    options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
                    correct: 1
                },
                {
                    question: "What is the hardest natural substance on Earth?",
                    options: ["Gold", "Iron", "Diamond", "Quartz"],
                    correct: 2
                }
            ],
            history: [
                {
                    question: "Who was the first President of the United States?",
                    options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"],
                    correct: 1
                },
                {
                    question: "What year did World War II end?",
                    options: ["1942", "1945", "1950", "1939"],
                    correct: 1
                },
                {
                    question: "Who discovered America?",
                    options: ["Christopher Columbus", "Marco Polo", "Ferdinand Magellan", "Leif Erikson"],
                    correct: 0
                },
                {
                    question: "What was the name of the ship that brought the Pilgrims to America?",
                    options: ["Santa Maria", "Mayflower", "HMS Victory", "Endeavour"],
                    correct: 1
                },
                {
                    question: "Which empire was known for its road system in ancient times?",
                    options: ["Roman Empire", "Mongol Empire", "Ottoman Empire", "Greek Empire"],
                    correct: 0
                }
            ],
            technology: [
                {
                    question: "Who is known as the father of the computer?",
                    options: ["Charles Babbage", "Alan Turing", "Steve Jobs", "Bill Gates"],
                    correct: 0
                },
                {
                    question: "What does HTML stand for?",
                    options: ["Hyper Text Markup Language", "High Transfer Machine Language", "Hyper Transfer Markup Language", "Hyperlink Textual Machine Language"],
                    correct: 0
                },
                {
                    question: "Which company developed the Android operating system?",
                    options: ["Apple", "Google", "Microsoft", "Samsung"],
                    correct: 1
                },
                {
                    question: "What is the term for malicious software?",
                    options: ["Virus", "Malware", "Spyware", "Ransomware"],
                    correct: 1
                },
                {
                    question: "Which programming language is known for its snake-like name?",
                    options: ["Cobra", "Python", "Viper", "Anaconda"],
                    correct: 1
                }
            ],
            sports: [
                {
                    question: "How many players are on a standard soccer team?",
                    options: ["10", "11", "12", "9"],
                    correct: 1
                },
                {
                    question: "Which country won the FIFA World Cup in 2018?",
                    options: ["Germany", "Argentina", "France", "Brazil"],
                    correct: 2
                },
                {
                    question: "What sport uses a shuttlecock?",
                    options: ["Badminton", "Tennis", "Squash", "Ping Pong"],
                    correct: 0
                },
                {
                    question: "What is the term for a score of zero in tennis?",
                    options: ["Zero", "Nil", "Love", "None"],
                    correct: 2
                },
                {
                    question: "In which country were the first modern Olympic Games held?",
                    options: ["Italy", "France", "Greece", "United Kingdom"],
                    correct: 2
                }
            ]
        };

        let totalInserted = 0;
        for (const category in quizData) {
            const questions = quizData[category].map(q => ({
                category,
                ...q
            }));
            const result = await Question.insertMany(questions);
            totalInserted += result.length;
            console.log(`Inserted ${result.length} questions for ${category} category`);
        }
        console.log(`Successfully initialized ${totalInserted} total questions`);

        const finalCount = await Question.countDocuments();
        const categories = await Question.distinct('category');
        console.log('\nFinal database state:');
        console.log(`Total questions: ${finalCount}`);
        for (const category of categories) {
            const categoryCount = await Question.countDocuments({ category });
            console.log(`${category}: ${categoryCount} questions`);
        }
    } catch (error) {
        console.error('Error during database initialization:', error);
        throw error; 
    }
}

app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Username or email already exists' 
            });
        }
        
        const user = new User({ username, email, password });
        await user.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/debug/questions', async (req, res) => {
    try {
        const counts = await Question.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        const allQuestions = await Question.find({});
        res.json({
            totalQuestions: allQuestions.length,
            categoryCounts: counts,
            questions: allQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        
        if (user) {
            req.session.userId = user._id;
            req.session.username = user.username;
            res.json({ 
                message: 'Login successful', 
                username: user.username 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ error: 'Logout failed' });
        } else {
            res.json({ message: 'Logged out successfully' });
        }
    });
});

app.get('/api/questions/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const questions = await Question.find({ category })
            .select('-correct');  
        
        if (!questions.length) {
            return res.status(404).json({ 
                error: 'Category not found or no questions available' 
            });
        }
        
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
        
        res.json(shuffledQuestions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

app.post('/api/verify-answer', async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        const question = await Question.findById(questionId);
        
        if (!question) {
            return res.status(404).json({ 
                error: 'Question not found' 
            });
        }
        
        const correct = question.correct === selectedAnswer;
        res.json({ 
            correct,
            correctAnswer: question.correct 
        });
    } catch (error) {
        console.error('Error verifying answer:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});