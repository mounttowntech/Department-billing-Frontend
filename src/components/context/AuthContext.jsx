import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext();


// ============================================================
// ROLE MAP
// ============================================================

const ROLE_MAP = {
  "6a67377c05ad032ebca92369":
    "ADMIN",

  "6a8d33c64fa7104c77dcf67d":
    "SALES_EXECUTIVE",

  "6a8d33db4fa7104c77dcf67e":
    "CASHIER",

  "6a8d33e74fa7104c77dcf67f":
    "MANAGER",
};


// ============================================================
// GET ROLE FROM JWT
// ============================================================

function getRoleFromToken(token) {
  try {
    if (!token) return "";

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    const roleId = payload?.role;

    const roleCode =
      ROLE_MAP[roleId] || "";

    return roleCode;

  } catch (error) {
    console.error(
      "JWT decode error:",
      error
    );

    return "";
  }
}


// ============================================================
// NORMALIZE USER
// ============================================================

function normalizeUser(
  userData,
  token
) {
  const rawUser =
    userData?.user ||
    userData?.data?.user ||
    userData?.data ||
    userData ||
    {};

  const tokenRole =
    getRoleFromToken(token);

  const roleCode = String(
    rawUser?.role?.roleCode ||
      rawUser?.roleCode ||
      rawUser?.roleName ||
      rawUser?.role?.name ||
      tokenRole ||
      ""
  )
    .trim()
    .toUpperCase();

  const roleName =
    rawUser?.role?.roleName ||
    rawUser?.roleName ||
    roleCode;

  const cleanUser = {
    ...rawUser,

    _id:
      rawUser?._id || "",

    firstName:
      rawUser?.firstName || "",

    lastName:
      rawUser?.lastName || "",

    email:
      rawUser?.email || "",

    phone:
      rawUser?.phone || "",

    roleCode,

    roleName,

    role:
      rawUser?.role || null,

    store:
      rawUser?.store || null,

    salary:
      rawUser?.salary ?? 0,

    status:
      rawUser?.status || "",

    joiningDate:
      rawUser?.joiningDate || null,

    createdAt:
      rawUser?.createdAt || null,

    updatedAt:
      rawUser?.updatedAt || null,

    lastLogin:
      rawUser?.lastLogin || null,
  };

  return cleanUser;
}


// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({
  children,
}) {

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "user"
        );

      if (!savedUser) {
        return null;
      }

      return JSON.parse(
        savedUser
      );

    } catch (error) {
      console.error(
        "User restore error:",
        error
      );

      return null;
    }
  });


  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        "token"
      ) || ""
    );


  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // RESTORE AUTH
  // ==========================================================

  useEffect(() => {

    if (!token) {

      delete axios.defaults
        .headers.common[
          "Authorization"
        ];

      return;
    }

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;


    setUser((currentUser) => {

      if (!currentUser) {
        return null;
      }

      const tokenRole =
        getRoleFromToken(token);

      const updatedUser = {
        ...currentUser,

        roleCode:
          currentUser?.role?.roleCode ||
          currentUser?.roleCode ||
          tokenRole,

        roleName:
          currentUser?.role?.roleName ||
          currentUser?.roleName ||
          tokenRole,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          updatedUser
        )
      );

      return updatedUser;
    });

  }, [token]);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = (
    userData,
    userToken
  ) => {

    const cleanUser =
      normalizeUser(
        userData,
        userToken
      );

    setUser(cleanUser);

    setToken(userToken);

    localStorage.setItem(
      "user",
      JSON.stringify(
        cleanUser
      )
    );

    localStorage.setItem(
      "token",
      userToken
    );

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${userToken}`;

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    setUser(null);

    setToken("");

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    delete axios.defaults
      .headers.common[
        "Authorization"
      ];
  };


  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = (
    updatedData,
    newToken = null
  ) => {

    setUser((previousUser) => {

      const mergedUser = {
        ...(previousUser || {}),
        ...(updatedData || {}),

        // IMPORTANT:
        // Preserve role if backend
        // doesn't return it.
        role:
          updatedData?.role ||
          previousUser?.role ||
          null,

        // IMPORTANT:
        // Preserve store.
        store:
          updatedData?.store ||
          previousUser?.store ||
          null,
      };


      // Recalculate role
      mergedUser.roleCode =
        mergedUser?.role?.roleCode ||
        mergedUser?.roleCode ||
        "";

      mergedUser.roleName =
        mergedUser?.role?.roleName ||
        mergedUser?.roleName ||
        mergedUser.roleCode ||
        "";


      // Save latest user
      // to localStorage.
      localStorage.setItem(
        "user",
        JSON.stringify(
          mergedUser
        )
      );


      return mergedUser;
    });


    // If backend provides
    // a new token.
    if (newToken) {

      setToken(newToken);

      localStorage.setItem(
        "token",
        newToken
      );

      axios.defaults.headers.common[
        "Authorization"
      ] =
        `Bearer ${newToken}`;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        login,
        logout,

        updateUser,

        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// HOOK
// ============================================================

export const useAuth = () =>
  useContext(AuthContext);