import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../api/client";

const AuthContext = createContext(null);
const ACCOUNTS_KEY = "socialconnect_accounts";

const readAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("socialconnect_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [accounts, setAccounts] = useState(readAccounts);

  const saveAccount = (payload) => {
    const nextAccount = { token: payload.token, user: payload.user };
    const nextAccounts = [
      nextAccount,
      ...accounts.filter((account) => account.user?._id !== payload.user?._id)
    ];

    writeAccounts(nextAccounts);
    setAccounts(nextAccounts);
  };

  const saveSession = (payload) => {
    localStorage.setItem("socialconnect_token", payload.token);
    localStorage.setItem("socialconnect_user", JSON.stringify(payload.user));
    saveAccount(payload);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    saveSession(data.data);
    return data.data.user;
  };

  const register = async (form) => {
    const { data } = await api.post("/auth/register", form);
    saveSession(data.data);
    return data.data.user;
  };

  const createAccount = async (form) => {
    const { data } = await api.post("/auth/register", form);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem("socialconnect_token");
    localStorage.removeItem("socialconnect_user");
    setUser(null);
  };

  const switchAccount = (accountId) => {
    const account = accounts.find((item) => item.user?._id === accountId);
    if (!account) return false;

    localStorage.setItem("socialconnect_token", account.token);
    localStorage.setItem("socialconnect_user", JSON.stringify(account.user));
    setUser(account.user);
    toast.success(`Switched to @${account.user.username}`);
    return true;
  };

  const addAccount = () => {
    logout();
  };

  const refreshMe = async () => {
    const token = localStorage.getItem("socialconnect_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("socialconnect_user", JSON.stringify(data.data));
      saveAccount({ token, user: data.data });
      setUser(data.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"]
    });
    socket.emit("user:join", user._id);
    socket.on("notification:new", (notification) => {
      toast(`${notification.sender?.username || "Someone"} ${notification.text}`);
      window.dispatchEvent(new Event("notification:new"));
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, createAccount, logout, switchAccount, addAccount, accounts, refreshMe, socket }),
    [user, loading, socket, accounts]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
