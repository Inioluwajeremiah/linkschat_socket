import { useSelector } from "react-redux";
import { APIEndPoints } from "../../utils/ApiEndpoints";

const Pewtertoken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1Bld3Rlcl9CdWlsZGluZyIsInVzZXJfaWQiOiJQZXd0ZXJfQnVpbGRpbmciLCJ2YWxpZGl0eV9pbl9zZWNvbmRzIjo2MDQ4MDAsImlhdCI6MTc1NDc1MTY5MCwiZXhwIjoxNzU1MzU2NDkwfQ.hJheTPqGQRdAsYOJZrb5sAInw9Xv-zQcC_PAen_uY4U";

// Fdhm6qYZMlREqyqElRi6;

export const useGetStreamUserCredential = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  console.log("useGetStreamUserCredential userId ==>> ", userId);

  return {
    userId:
      userId === "JuQOyQQgYhxO0vixSnqE"
        ? "Pewter_Building"
        : APIEndPoints.userID,
    token:
      userId === "JuQOyQQgYhxO0vixSnqE"
        ? Pewtertoken
        : APIEndPoints.STREAM_TOKEN,
    userName:
      userId === "JuQOyQQgYhxO0vixSnqE"
        ? "Pewter Building"
        : APIEndPoints.STREAM_USERNAME,
  };
};
