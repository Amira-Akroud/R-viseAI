import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [questions, setQuestions] = useState([])

  const handleUpload = async () => {
    if (!file) return alert("Sélectionnez un fichier d'abord !")
    
    setIsLoading(true) // كيبدا الـ Loading

    // محاكاة للوقت اللي كياخدو الـ AI (مثلا 3 ثواني)
    setTimeout(() => {
      // هنا غادي نحطو من بعد الكود اللي كيجيب الأسئلة من الـ Backend
      const fetchedQuestions = [
        { q: "Qu'est-ce qu'une variable ?", options: ["Un conteneur", "Un fichier", "Un écran"], ans: "Un conteneur" },
        { q: "React est-il une librairie ?", options: ["Oui", "Non", "Peut-être"], ans: "Oui" },
        { q: "JSX signifie quoi ?", options: ["JavaScript XML", "Java Syntax", "JSON X"], ans: "JavaScript XML" }
      ]
      setQuestions(fetchedQuestions)
      setIsLoading(false) // كيسالي الـ Loading
      setIsQuizMode(true)
    }, 3000) 
  }

  const handleAnswer = (opt) => {
    setSelectedAnswer(opt)
    if (opt === questions[currentQuestion].ans) setScore(score + 1)

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
      }
    }, 1000)
  }

  const reset = () => {
    setFile(null); setIsQuizMode(false); setCurrentQuestion(0); setScore(0); setShowResult(false); setSelectedAnswer(null);
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="loader"></div>
        <p>L'IA analyse votre PDF et génère le quiz...</p>
      </div>
    )
  }

  if (!isQuizMode) {
    return (
      <div className="container">
        <h1>R-viseAI</h1>
        <div className="card">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} className="btn-main">Générer le Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {showResult ? (
        <div className="card">
          <h2>Résultat Final</h2>
          <div className="score-big">{score} / {questions.length}</div>
          <button onClick={reset} className="btn-main">Recommencer</button>
        </div>
      ) : (
        <div className="card">
          <div className="progress">Question {currentQuestion + 1} sur {questions.length}</div>
          <h3>{questions[currentQuestion].q}</h3>
          <div className="options">
            {questions[currentQuestion].options.map(opt => {
              let btnClass = "opt-btn";
              if (selectedAnswer) {
                if (opt === questions[currentQuestion].ans) btnClass += " correct";
                else if (opt === selectedAnswer) btnClass += " wrong";
              }
              return (
                <button key={opt} className={btnClass} onClick={() => !selectedAnswer && handleAnswer(opt)} disabled={selectedAnswer !== null}>
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