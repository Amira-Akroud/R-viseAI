import { useState } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [authError, setAuthError] = useState('')
  const [files, setFiles] = useState([])
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [showWrong, setShowWrong] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')
    try {
      const endpoint = isSignUp ? 'register' : 'login'
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) return setAuthError(data.message)
      localStorage.setItem('token', data.token)
      setIsLoggedIn(true)
    } catch (err) {
      setAuthError("Impossible de contacter le serveur")
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return alert("Sélectionnez au moins un fichier PDF !")
    setIsLoading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch('http://localhost:5000/generate-quiz', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setQuestions(data)
      setIsQuizMode(true)
    } catch (err) {
      alert("Erreur lors de la génération du quiz")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnswer = (opt) => {
    setSelectedAnswer(opt)
    if (opt === questions[currentQuestion].ans) {
      setScore(score + 1)
      setShowWrong(false)
    } else {
      setWrongAnswers(prev => [...prev, {
        question: questions[currentQuestion].q,
        yourAnswer: opt,
        correct: questions[currentQuestion].ans
      }])
      setShowWrong(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  // ======= AUTH =======
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="auth-card">
          <h1 className="logo-pink">R-viseAI</h1>
          <p className="pink-subtitle">
            {isSignUp ? "Créer un compte" : "Réviser avec élégance."}
          </p>
          <form onSubmit={handleAuth}>
            {isSignUp && <input name="name" type="text" placeholder="Nom complet" required />}
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Mot de passe" required />
            {authError && <p className="auth-error">{authError}</p>}
            <button type="submit" className="btn-green">
              {isSignUp ? "S'inscrire" : "Se connecter"}
            </button>
          </form>
          <hr className="divider" />
          <button className="btn-pink-small" onClick={() => { setIsSignUp(!isSignUp); setAuthError('') }}>
            {isSignUp ? "Déjà un compte ? Se connecter" : "Créer un nouveau compte"}
          </button>
        </div>
      </div>
    )
  }

  // ======= LOADING =======
  if (isLoading) return (
    <div className="container">
      <div className="loader"></div>
    </div>
  )

  // ======= MAIN APP =======
  return (
    <div className="container">
      {!isQuizMode ? (

        // ======= UPLOAD =======
        <div className="card-pink">
          <h1 className="logo-pink">R-viseAI</h1>
          <p className="pink-c">Prêt pour votre quiz ? </p>
          <div className="file-wrapper">
            <label className="file-label" htmlFor="fileInput">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="file-label-text">
                {files.length > 0 ? '+ Ajouter un autre PDF' : 'Choisir des fichiers PDF'}
              </span>
            </label>
            <input id="fileInput" type="file" accept=".pdf" multiple onChange={handleFiles} className="file-input" />
            {files.length > 0 && (
              <div className="file-list">
                {files.map((f, i) => (
                  <div key={i} className="file-item">
                    <span>{f.name}</span>
                    <button onClick={() => removeFile(i)} className="file-remove">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleUpload} className="btn-green">Générer le Quiz</button>
          <button onClick={handleLogout} className="btn-logout">Se déconnecter</button>
        </div>

      ) : showResult ? (

        // ======= RESULT =======
        <div className="card-pink">
          <h2 className="result-title">Résultat Final 🎉</h2>
          <div className="score-big">{score} / {questions.length}</div>
          {wrongAnswers.length > 0 && (
            <div className="wrong-list">
              <h3 className="wrong-list-title">❌ Erreurs à revoir :</h3>
              {wrongAnswers.map((w, i) => (
                <div key={i} className="wrong-item">
                  <p className="wrong-item-question">{w.question}</p>
                  <p className="wrong-item-yours">❌ Ta réponse : {w.yourAnswer}</p>
                  <p className="wrong-item-correct">✅ Bonne réponse : {w.correct}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => window.location.reload()} className="btn-green btn-retry">Réessayer</button>
        </div>

      ) : (

        // ======= QUIZ =======
        <div className="card-pink" key={currentQuestion}>
          
          <div className="quiz-content">
            <div className="progress">Question {currentQuestion + 1} / {questions.length}</div>
            <h3 className="question-text">{questions[currentQuestion].q}</h3>
            <div className="options-list">
              {questions[currentQuestion].options.map(opt => {
                let clss = "opt-btn-pink"
                if (selectedAnswer) {
                  if (opt === questions[currentQuestion].ans) clss += " correct"
                  else if (opt === selectedAnswer) clss += " wrong"
                }
                return (
                  <button key={opt} className={clss} onClick={() => !selectedAnswer && handleAnswer(opt)}>
                    {opt}
                  </button>
                )
              })}
          </div>
              {currentQuestion > 0 && !selectedAnswer && (
                <button className="btn-back" onClick={() => {
                  setCurrentQuestion(currentQuestion - 1)
                  setSelectedAnswer(null)
                }}>←</button>
              )}
          </div>
           
              <button className="btn-next" onClick={() => {
                setShowWrong(false)
                if (currentQuestion + 1 < questions.length) {
                  setCurrentQuestion(currentQuestion + 1)
                  setSelectedAnswer(null)
                } else {
                  setShowResult(true)
                }
              }}>
                {currentQuestion + 1 < questions.length ? 'Suivant ➜' : 'Voir les résultats 🎉'}
              </button>
           
          {showWrong && (
            <div className="wrong-feedback">
              <p className="wrong-feedback-title">❌ Réponse incorrecte !</p>
              <p className="wrong-feedback-correct">✔️ Bonne réponse : <strong>{questions[currentQuestion].ans}</strong></p>
            </div>
          )}
        </div>

      )}
    </div>
  )
}

export default App