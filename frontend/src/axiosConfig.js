import axios from "axios";
import config from "./config";

const instance = axios.create({
  baseURL: "https://timekeeper.primebot.pl/api",
});
