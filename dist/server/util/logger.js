"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const logdown_1 = __importDefault(require("logdown"));
exports.getLogger = (title) => {
    const logger = logdown_1.default(`ToDServer::${title}`);
    logger.state.isEnabled = true;
    return logger;
};
