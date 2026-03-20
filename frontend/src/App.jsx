import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import BookingPage from "./pages/BookingPage";
import DefaultLayout from "./layout/DefaultLayout";
import { Routes, Route, BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={< HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<NotFoundPage />} />

          </Route>

        </Routes>
      </BrowserRouter >

    </>
  );
}
