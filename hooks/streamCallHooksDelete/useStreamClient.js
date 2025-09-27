import { useSelector } from "react-redux";

export const useStreamClient = () => {
  const client = useSelector((state) => state.stream);
  return client;
};
