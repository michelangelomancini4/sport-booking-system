import DemoApp from "./pages/DemoPage";
import HomePage from "./pages/Homepage";
import DefaultLayout from "./layout/DefaultLayout";
import { Routes, Route, BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={< HomePage />} />
            <Route path="/demo" element={<DemoApp />} />
          </Route>

        </Routes>
      </BrowserRouter >

    </>
  );
}
