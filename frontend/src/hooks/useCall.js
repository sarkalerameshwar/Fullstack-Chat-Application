import { useContext } from "react";
import { CallContext } from "../context/CallContext.jsx";

export const useCall = () => useContext(CallContext);
