import express from "express";

import authentication from "./authentication";
import brands from "./brands";
import members from "./members";
import watches from "./watches";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  members(router);
  watches(router);
  brands(router);
  return router;
};
