import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "../index.css";
import api from "../utils/Api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import MainPage from "./MainPage";
import Login from "./Login";
import Register from "./Register";
import { checkToken, login, register } from "../utils/auth";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";

function App() {
  const navigate = useNavigate();

  const [token, setToken] = useState("")
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isSuccessPopupOpened, setIsSuccessPopupOpened] = useState(false);
  const [isFailPopupOpened, setIsFailPopupOpened] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUserToken = (token) => {
    return checkToken(token)
      .then((res) => {
        setUserEmail(res.email);
        setLoggedIn(true);
        setToken(token);
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const _token = localStorage.getItem("token")
    if (!loggedIn && _token) {
      checkUserToken(_token)
    }
  }, [checkUserToken, loggedIn, token])

  useEffect(() => {
    if (loggedIn) {
      api(token)
        .getUserInfo()
        .then((res) => setCurrentUser(res))
        .catch((err) => console.log(err));

      api(token)
        .getInitialCards()
        .then((data) => setCards(data))
        .catch((error) => console.log(error));
    }
  }, [loggedIn, token]);

  const handleEditAvatarClick = () => setIsEditAvatarPopupOpen(true);
  const handleEditProfileClick = () => setIsEditProfilePopupOpen(true);
  const handleAddPlaceClick = () => setIsAddPlacePopupOpen(true);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeAllPopups = () => {
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsImagePopupOpen(false);
    setSelectedCard(null);
    setIsSuccessPopupOpened(false);
    setIsFailPopupOpened(false);
  };

  const handleUpdateAvatar = (avatar) => {
    api(token)
      .editAvatar(avatar)
      .then((userData) => {
        setCurrentUser(userData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateUser = (name, about) => {
    api(token)
      .setUserInfo(name, about)
      .then((userData) => {
        setCurrentUser(userData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  const handleAddPlaceSubmit = (name, link) => {
    api(token)
      .addCard(name, link)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  const handleCardLike = (card) => {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api(token)
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  };

  const handleCardDelete = (card) => {
    api(token)
      .deleteCard(card._id)
      .then(() => {
        setCards(cards.filter((newCard) => newCard._id !== card._id));
      })
      .catch((err) => console.log(err));
  };

  const onRegistrationSubmit = (password, email) => {
    register(password, email)
      .then((res) => {
        setIsSuccessPopupOpened(true);
      })
      .catch((err) => setIsFailPopupOpened(true));
  };

  const onLoginSubmit = (password, email) => {
    login(password, email)
      .then((res) => {
        localStorage.setItem("token", res.token);
        setToken(res.token);
        return res.token;
      })
      .then((token) => checkUserToken(token))
      .catch((err) => setIsFailPopupOpened(true));
  };

  const onSignOut = () => {
    setLoggedIn(false);
    setToken('');
    localStorage.removeItem('token');
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                element={MainPage}
                userEmail={userEmail}
                isEditAvatarPopupOpen={isEditAvatarPopupOpen}
                isEditProfilePopupOpen={isEditProfilePopupOpen}
                isAddPlacePopupOpen={isAddPlacePopupOpen}
                isImagePopupOpen={isImagePopupOpen}
                selectedCard={selectedCard}
                handleCardLike={handleCardLike}
                handleCardDelete={handleCardDelete}
                handleEditAvatarClick={handleEditAvatarClick}
                handleEditProfileClick={handleEditProfileClick}
                handleAddPlaceClick={handleAddPlaceClick}
                handleCardClick={handleCardClick}
                handleUpdateUser={handleUpdateUser}
                handleUpdateAvatar={handleUpdateAvatar}
                handleAddPlaceSubmit={handleAddPlaceSubmit}
                cards={cards}
                currentUser={currentUser}
                closeAllPopups={closeAllPopups}
                loggedIn={loggedIn}
                onSignOut={onSignOut}
              />
            }
          />
          <Route
            path="/sign-up"
            element={
              <Register onRegistrationSubmit={onRegistrationSubmit} />
            }
          />
          <Route
            path="/sign-in"
            element={
              <Login onLoginSubmit={onLoginSubmit} loggedIn={loggedIn} />
            }
          />
        </Routes>
        <InfoTooltip isOpen={isSuccessPopupOpened} isSuccess={true} onClose={closeAllPopups} />
        <InfoTooltip isOpen={isFailPopupOpened} isSuccess={false} onClose={closeAllPopups} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
