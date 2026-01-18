// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/Homepages';
import UploadPDF from './components/UploadPDF';
import AskQuestion from './components/AskQuestion';
import './App.css';

function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     {/* Routes with Layout (navbar + footer) */}
    //     <Route path='/' element={<Layout />}>
    //       <Route index element={<HomePage />} />
    //       <Route path='upload' element={<UploadPDF />} />
    //       <Route path='ask' element={<AskQuestion />} />
    //     </Route>
    //   </Routes>
    // </BrowserRouter>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;