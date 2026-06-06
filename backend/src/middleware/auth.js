const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dcoj-dev-secret-change-in-production";

function signToken(user) {
    return jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Vui lòng đăng nhập" });
    }

    try {
        const payload = jwt.verify(header.slice(7), JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
    }
}

function optionalAuth(req, res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
        try {
            req.user = jwt.verify(header.slice(7), JWT_SECRET);
        } catch {
            // ignore invalid token
        }
    }
    next();
}

module.exports = { signToken, requireAuth, optionalAuth, JWT_SECRET };
