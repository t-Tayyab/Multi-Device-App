class Quiz {
    constructor(category) {
        this.category = category;
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 30;
    }

    async loadQuestions() {
        try {
            const response = await fetch(`http://localhost:3000/api/questions/${this.category}`);
            if (!response.ok) {
                throw new Error('Failed to load questions');
            }
            const data = await response.json();
            this.questions = data;
            this.loadQuestion();
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Returning to home page.');
            window.location.href = 'index.html';
        }
    }

    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestion];
        document.getElementById('question').textContent = question.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option');
            button.dataset.index = index;
            button.addEventListener('click', () => this.checkAnswer(index));
            optionsContainer.appendChild(button);
        });

        this.startTimer();
    }

    async checkAnswer(selectedIndex) {
        clearInterval(this.timer);
        const buttons = document.querySelectorAll('.option');
        buttons.forEach(button => button.disabled = true); 

        try {
            const response = await fetch('http://localhost:3000/api/verify-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionId: this.questions[this.currentQuestion]._id,
                    selectedAnswer: selectedIndex
                })
            });

            const data = await response.json();
            if (data.correct) {
                this.score++;
                buttons[selectedIndex].classList.add('correct');
            } else {
                buttons[selectedIndex].classList.add('wrong');
                buttons[data.correctAnswer].classList.add('correct');
            }

            setTimeout(() => {
                this.currentQuestion++;
                this.loadQuestion();
            }, 1500);
            
        } catch (error) {
            console.error('Error verifying answer:', error);
        }
    }

    startTimer() {
        clearInterval(this.timer);
        this.timeLeft = 30;
        document.getElementById('timer').textContent = `${this.timeLeft}s`;

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = `${this.timeLeft}s`;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                const buttons = document.querySelectorAll('.option');
                buttons.forEach(button => button.disabled = true);
                
                this.showCorrectAnswer();
                
                setTimeout(() => {
                    this.currentQuestion++;
                    this.loadQuestion();
                }, 1500);
            }
        }, 1000);
    }

    async showCorrectAnswer() {
        try {
            const response = await fetch('http://localhost:3000/api/verify-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionId: this.questions[this.currentQuestion]._id,
                    selectedAnswer: -1 
                })
            });

            const data = await response.json();
            const buttons = document.querySelectorAll('.option');
            buttons[data.correctAnswer].classList.add('correct');
        } catch (error) {
            console.error('Error showing correct answer:', error);
        }
    }

    endQuiz() {
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('score').textContent = `Your Score: ${this.score}/${this.questions.length}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (!category) {
        window.location.href = 'index.html';
        return;
    }

    const quiz = new Quiz(category);
    quiz.loadQuestions();
});