import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null) // كيعقل على الجواب اللي تختار

  const mockQuestions = [
    { q: "Qu'est-ce qu'une variable ?", options: ["Un conteneur", "Un fichier", "Un écran"], ans: "Un conteneur" },
    { q: "React est-il une librairie ?", options: ["Oui", "Non", "Peut-être"], ans: "Oui" },
    { q: "JSX signifie quoi ?", options: ["JavaScript XML", "Java Syntax", "JSON X"], ans: "JavaScript XML" }
  ]

  const handleAnswer = (opt) => {
    setSelectedAnswer(opt) // كنبينو التصحيح أولاً
    
    if (opt === mockQuestions[currentQuestion].ans) {
      setScore(score + 1)
    }

    // كنتسناو ثانية وحدة (1000ms) باش يشوف التصحيح عاد كيدوز للسؤال التالي
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1
      if (nextQuestion < mockQuestions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedAnswer(null) // كنمسحو الاختيار للسؤال الجديد
      } else {
        setShowResult(true)
      }
    }, 1000)
  }

  const reset = () => {
    setFile(null); setIsQuizMode(false); setCurrentQuestion(0); setScore(0); setShowResult(false); setSelectedAnswer(null);
  }

  if (!isQuizMode) {
    return (
      <div className="container">
        <h1>R-viseAI</h1>
        <div className="card">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={() => file ? setIsQuizMode(true) : alert("PDF d'abord!")} className="btn-main">Générer le Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {showResult ? (
        <div className="card">
          <h2>Résultat Final</h2>
          <div className="score-big">{score} / {mockQuestions.length}</div>
          <button onClick={reset} className="btn-main">Recommencer</button>
        </div>
      ) : (
        <div className="card">
          <div className="progress">Question {currentQuestion + 1} sur {mockQuestions.length}</div>
          <h3>{mockQuestions[currentQuestion].q}</h3>
          <div className="options">
            {mockQuestions[currentQuestion].options.map(opt => {
              // تحديد لون الزرار بناءً على التصحيح
              let btnClass = "opt-btn";
              if (selectedAnswer) {
                if (opt === mockQuestions[currentQuestion].ans) btnClass += " correct";
                else if (opt === selectedAnswer) btnClass += " wrong";
              }

              return (
                <button 
                  key={opt} 
                  className={btnClass} 
                  onClick={() => !selectedAnswer && handleAnswer(opt)}
                  disabled={selectedAnswer !== null} // مكنخليوش يورك بزاف المرات
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default App