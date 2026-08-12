import Header from './components/Header'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import ProductDetails from './pages/ProductDetails'
import CategoryPage from './pages/CategoryPage'
function App() {
  

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
