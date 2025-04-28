"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'Get all users' });
});
router.get('/:id', (req, res) => {
    res.json({ message: `Get user with id ${req.params.id}` });
});
router.post('/', (req, res) => {
    res.json({ message: 'User created', data: req.body });
});
exports.default = router;
