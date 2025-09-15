/**
 * QuizModule.js - Modular Quiz System
 * A reusable quiz module for educational games
 * 
 * @version 1.0.0
 * @author Polor Team
 */

class QuizModule {
  constructor(options = {}) {
    // Configuration
    this.config = {
      requiredCorrect: options.requiredCorrect || 1,
      voluntaryMode: options.voluntaryMode || false,
      showImages: options.showImages !== false,
      imageWidth: options.imageWidth || 400,
      imageHeight: options.imageHeight || 200,
      wrongAnswerDelay: options.wrongAnswerDelay || 3000,
      bonusPoints: options.bonusPoints || 50,
      enableStats: options.enableStats !== false,
      ...options
    };

    // State
    this.quizData = null;
    this.usedQuestionIndices = [];
    this.currentQuestion = null;
    this.currentQuestionIndex = -1;
    this.correctAnswersInSession = 0;
    this.isActive = false;
    this.isWaitingForAnswer = false;

    // Statistics
    this.stats = {
      totalQuestionsAsked: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      correctAnswers: [],
      wrongAnswers: [],
      streakCount: 0,
      bestStreak: 0,
      pointsEarned: 0
    };

    // Callbacks
    this.callbacks = {
      onQuizComplete: null,
      onCorrectAnswer: null,
      onWrongAnswer: null,
      onQuizShow: null,
      onQuizHide: null
    };

    // DOM elements
    this.modalElement = null;
    this.isInitialized = false;

    this.init();
  }

  /**
   * Initialize the quiz module
   */
  init() {
    this.createQuizModal();
    this.loadQuizData();
    this.isInitialized = true;
  }

  /**
   * Load quiz data from URL parameters or use provided data
   */
  loadQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedQuiz = urlParams.get('qb64'); // Use 'qb64' parameter for quiz base64 data
    
    if (encodedQuiz) {
      try {
        const decodedQuiz = atob(encodedQuiz);
        this.quizData = JSON.parse(decodedQuiz);
        console.log('Quiz loaded from qb64 parameter:', this.quizData);
      } catch (error) {
        console.error('Error loading quiz from qb64 URL parameter:', error);
        this.useDefaultQuestions();
      }
    } else {
      console.log('No qb64 parameter found, using default questions');
      this.useDefaultQuestions();
    }
  }

  /**
   * Set quiz data manually
   * @param {Object} quizData - Quiz data object
   */
  setQuizData(quizData) {
    this.quizData = quizData;
    this.resetSession();
  }

  /**
   * Use default questions as fallback
   */
  useDefaultQuestions() {
    this.quizData = {
      title: "Default Quiz",
      questions: [
        {
          question: "What is 2 + 2?",
          answers: ["3", "4", "5", "6"],
          correct: 1
        },
        {
          question: "Which planet is closest to the Sun?",
          answers: ["Venus", "Mercury", "Earth", "Mars"],
          correct: 1
        },
        {
          question: "What is the capital of France?",
          answers: ["London", "Berlin", "Paris", "Madrid"],
          correct: 2
        }
      ]
    };
  }

  /**
   * Create the quiz modal DOM structure
   */
  createQuizModal() {
    if (this.modalElement) return;

    const modal = document.createElement('div');
    modal.className = 'quiz-module-modal hidden';
    modal.innerHTML = `
      <div class="quiz-module-card">
        <div class="quiz-module-header">
          <h2 class="quiz-module-title">Answer to Continue!</h2>
          <div class="quiz-module-progress">
            <span class="quiz-module-progress-text">0 of ${this.config.requiredCorrect} correct</span>
          </div>
        </div>
        <img class="quiz-module-image" src="" alt="Question illustration" style="display: none;">
        <div class="quiz-module-question">Loading question...</div>
        <div class="quiz-module-answers"></div>
        <div class="quiz-module-result hidden"></div>
        <div class="quiz-module-actions">
          <button class="quiz-module-continue hidden" disabled>Continue</button>
          ${this.config.voluntaryMode ? '<button class="quiz-module-close">Close Quiz</button>' : ''}
        </div>
      </div>
    `;

    this.addQuizStyles();
    document.body.appendChild(modal);
    this.modalElement = modal;
    this.bindEvents();
  }

  /**
   * Add CSS styles for the quiz module
   */
  addQuizStyles() {
    if (document.getElementById('quiz-module-styles')) return;

    const style = document.createElement('style');
    style.id = 'quiz-module-styles';
    style.textContent = `
      .quiz-module-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .quiz-module-modal.hidden {
        display: none;
      }

      .quiz-module-card {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 700px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        border: 3px solid #42A5F5;
        animation: quizSlideIn 0.3s ease-out;
      }

      @keyframes quizSlideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .quiz-module-header {
        margin-bottom: 1.5rem;
      }

      .quiz-module-title {
        font-size: 1.5rem;
        color: #1565C0;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }

      .quiz-module-progress {
        font-size: 0.9rem;
        color: #666;
      }

      .quiz-module-image {
        width: 100%;
        max-width: 400px;
        height: 200px;
        object-fit: cover;
        border-radius: 15px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transition: opacity 0.3s ease;
      }

      .quiz-module-question {
        font-size: 1.2rem;
        color: #333;
        margin-bottom: 2rem;
        line-height: 1.4;
        font-weight: 500;
      }

      .quiz-module-answers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .quiz-module-answer {
        background: #F8F9FA;
        border: 2px solid #E3F2FD;
        padding: 1rem;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
        text-align: left;
      }

      .quiz-module-answer:hover {
        background: #E3F2FD;
        border-color: #42A5F5;
        transform: translateY(-2px);
      }

      .quiz-module-answer.correct {
        background: #4CAF50;
        color: white;
        border-color: #388E3C;
      }

      .quiz-module-answer.incorrect {
        background: #F44336;
        color: white;
        border-color: #D32F2F;
      }

      .quiz-module-answer:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .quiz-module-result {
        font-size: 1.1rem;
        font-weight: bold;
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 15px;
        line-height: 1.4;
      }

      .quiz-module-result.correct {
        background: #E8F5E8;
        color: #2E7D32;
        border: 2px solid #4CAF50;
      }

      .quiz-module-result.incorrect {
        background: #FFEBEE;
        color: #C62828;
        border: 2px solid #F44336;
      }

      .quiz-module-result.hidden {
        display: none;
      }

      .quiz-module-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .quiz-module-continue,
      .quiz-module-close {
        background: linear-gradient(135deg, #42A5F5, #1E88E5);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 15px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: all 0.3s ease;
        min-width: 120px;
      }

      .quiz-module-close {
        background: linear-gradient(135deg, #666, #555);
      }

      .quiz-module-continue:hover,
      .quiz-module-close:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(66, 165, 245, 0.4);
      }

      .quiz-module-continue:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .quiz-module-continue.hidden {
        display: none;
      }

      @media (max-width: 768px) {
        .quiz-module-answers {
          grid-template-columns: 1fr;
        }
        .quiz-module-card {
          padding: 1.5rem;
          margin: 1rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const continueBtn = this.modalElement.querySelector('.quiz-module-continue');
    const closeBtn = this.modalElement.querySelector('.quiz-module-close');

    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.handleContinue());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Set callback functions
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
  }

  /**
   * Show quiz modal
   * @param {Object} options - Additional options
   */
  show(options = {}) {
    if (!this.isInitialized || !this.quizData || !this.quizData.questions) {
      console.error('Quiz module not properly initialized or no quiz data available');
      return;
    }

    // Merge options
    Object.assign(this.config, options);

    this.isActive = true;
    this.displayQuestion();
    this.modalElement.classList.remove('hidden');

    if (this.callbacks.onQuizShow) {
      this.callbacks.onQuizShow();
    }
  }

  /**
   * Hide quiz modal
   */
  hide() {
    this.isActive = false;
    this.isWaitingForAnswer = false;
    this.modalElement.classList.add('hidden');

    if (this.callbacks.onQuizHide) {
      this.callbacks.onQuizHide();
    }
  }

  /**
   * Get next unused question
   */
  getNextQuestion() {
    if (!this.quizData || !this.quizData.questions) return null;

    // Reset used questions if all have been used
    if (this.usedQuestionIndices.length >= this.quizData.questions.length) {
      this.usedQuestionIndices = [];
    }

    let questionIndex;
    do {
      questionIndex = Math.floor(Math.random() * this.quizData.questions.length);
    } while (this.usedQuestionIndices.includes(questionIndex));

    this.usedQuestionIndices.push(questionIndex);
    this.currentQuestionIndex = questionIndex;

    return this.quizData.questions[questionIndex];
  }

  /**
   * Display current question
   */
  displayQuestion() {
    const question = this.getNextQuestion();
    if (!question) return;

    this.currentQuestion = question;
    this.isWaitingForAnswer = true;

    // Update progress
    const progressText = this.modalElement.querySelector('.quiz-module-progress-text');
    progressText.textContent = `${this.correctAnswersInSession} of ${this.config.requiredCorrect} correct`;

    // Update question text
    const questionEl = this.modalElement.querySelector('.quiz-module-question');
    questionEl.textContent = question.question;

    // Load image if enabled
    if (this.config.showImages) {
      this.loadQuestionImage(question);
    }

    // Create answer buttons
    this.createAnswerButtons(question);

    // Hide result and continue button
    this.modalElement.querySelector('.quiz-module-result').classList.add('hidden');
    this.modalElement.querySelector('.quiz-module-continue').classList.add('hidden');
    this.modalElement.querySelector('.quiz-module-continue').disabled = true;

    this.stats.totalQuestionsAsked++;
  }

  /**
   * Load question image
   */
  loadQuestionImage(question) {
    const imageEl = this.modalElement.querySelector('.quiz-module-image');
    const imagePrompt = `${question.question} ${question.answers[0]}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=${this.config.imageWidth}&height=${this.config.imageHeight}&nologo=true`;

    imageEl.src = imageUrl;
    imageEl.style.display = 'block';
    imageEl.style.opacity = '0.5';

    imageEl.onload = () => {
      imageEl.style.opacity = '1';
    };

    imageEl.onerror = () => {
      imageEl.style.display = 'none';
    };
  }

  /**
   * Create answer buttons
   */
  createAnswerButtons(question) {
    const answersEl = this.modalElement.querySelector('.quiz-module-answers');
    answersEl.innerHTML = '';

    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.className = 'quiz-module-answer';
      button.textContent = answer;
      button.onclick = () => this.selectAnswer(index);
      answersEl.appendChild(button);
    });
  }

  /**
   * Handle answer selection
   */
  selectAnswer(selectedIndex) {
    if (!this.isWaitingForAnswer || !this.currentQuestion) return;

    this.isWaitingForAnswer = false;
    const correctIndex = this.currentQuestion.correct;
    const isCorrect = selectedIndex === correctIndex;
    const buttons = this.modalElement.querySelectorAll('.quiz-module-answer');
    const resultEl = this.modalElement.querySelector('.quiz-module-result');
    const continueBtn = this.modalElement.querySelector('.quiz-module-continue');

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    // Highlight correct/incorrect answers
    buttons[correctIndex].classList.add('correct');
    if (!isCorrect) {
      buttons[selectedIndex].classList.add('incorrect');
    }

    // Update statistics
    if (isCorrect) {
      this.stats.totalCorrectAnswers++;
      this.stats.streakCount++;
      this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streakCount);
      this.stats.pointsEarned += this.config.bonusPoints;
      this.stats.correctAnswers.push({
        question: this.currentQuestion.question,
        answer: this.currentQuestion.answers[selectedIndex],
        timestamp: Date.now()
      });
      this.correctAnswersInSession++;
    } else {
      this.stats.totalWrongAnswers++;
      this.stats.streakCount = 0;
      this.stats.wrongAnswers.push({
        question: this.currentQuestion.question,
        selectedAnswer: this.currentQuestion.answers[selectedIndex],
        correctAnswer: this.currentQuestion.answers[correctIndex],
        timestamp: Date.now()
      });
    }

    // Show result
    if (isCorrect) {
      resultEl.textContent = 'Correct! Well done!';
      resultEl.className = 'quiz-module-result correct';
      
      // Check if session is complete
      if (this.correctAnswersInSession >= this.config.requiredCorrect) {
        continueBtn.textContent = 'Continue';
        continueBtn.disabled = false;
        continueBtn.classList.remove('hidden');
      } else {
        setTimeout(() => {
          this.displayQuestion();
        }, 1500);
      }

      if (this.callbacks.onCorrectAnswer) {
        this.callbacks.onCorrectAnswer({
          question: this.currentQuestion,
          points: this.config.bonusPoints,
          stats: this.getStats()
        });
      }
    } else {
      resultEl.textContent = `Incorrect. The correct answer was: ${this.currentQuestion.answers[correctIndex]}`;
      resultEl.className = 'quiz-module-result incorrect';

      if (this.callbacks.onWrongAnswer) {
        this.callbacks.onWrongAnswer({
          question: this.currentQuestion,
          selectedAnswer: this.currentQuestion.answers[selectedIndex],
          correctAnswer: this.currentQuestion.answers[correctIndex],
          stats: this.getStats()
        });
      }

      setTimeout(() => {
        this.displayQuestion();
      }, this.config.wrongAnswerDelay);
    }

    resultEl.classList.remove('hidden');
  }

  /**
   * Handle continue button click
   */
  handleContinue() {
    if (this.correctAnswersInSession >= this.config.requiredCorrect) {
      this.completeSession();
    }
  }

  /**
   * Complete quiz session
   */
  completeSession() {
    const sessionData = {
      correctAnswers: this.correctAnswersInSession,
      required: this.config.requiredCorrect,
      pointsEarned: this.correctAnswersInSession * this.config.bonusPoints,
      stats: this.getStats()
    };

    this.resetSession();
    this.hide();

    if (this.callbacks.onQuizComplete) {
      this.callbacks.onQuizComplete(sessionData);
    }
  }

  /**
   * Reset session data
   */
  resetSession() {
    this.correctAnswersInSession = 0;
    this.isWaitingForAnswer = false;
  }

  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      totalQuestionsAsked: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      correctAnswers: [],
      wrongAnswers: [],
      streakCount: 0,
      bestStreak: 0,
      pointsEarned: 0
    };
  }

  /**
   * Get accuracy percentage
   */
  getAccuracy() {
    if (this.stats.totalQuestionsAsked === 0) return 0;
    return Math.round((this.stats.totalCorrectAnswers / this.stats.totalQuestionsAsked) * 100);
  }

  /**
   * Destroy the quiz module
   */
  destroy() {
    if (this.modalElement) {
      this.modalElement.remove();
    }
    
    const styleEl = document.getElementById('quiz-module-styles');
    if (styleEl) {
      styleEl.remove();
    }

    this.isInitialized = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizModule;
}
if (typeof window !== 'undefined') {
  window.QuizModule = QuizModule;
}
