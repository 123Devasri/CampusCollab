import { useState } from 'react'
import './App.css'
import Project from './pages/Project'
import Navbar from './components/Navbar'
import Hackathon from './pages/Hackathon'
import Student from './pages/Student'
import {Routes,Route} from 'react-router-dom'
import {BrowserRouter} from 'react-router-dom'
import Home from './pages/Home'
import HackathonApi from './pages/HackathonApi'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Project />} />
          <Route path="/hackathons" element={<HackathonApi />} />
          <Route path="/students" element={<Student />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
