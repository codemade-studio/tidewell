import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
