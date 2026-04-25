import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Participants from "./pages/Participants";
import Analytics from "./pages/Analytics";
import Programs from "./pages/Programs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/programs" element={<Programs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;