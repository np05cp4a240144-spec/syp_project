const prisma = require('../config/db');

const parseScore = (score) => {
    const parsedScore = parseInt(score, 10);
    if (!parsedScore || parsedScore < 1 || parsedScore > 5) {
        return null;
    }
    return parsedScore;
};

const normalizeRatingType = (ratingType) => {
    const normalized = String(ratingType || '').trim().toUpperCase();
    if (normalized === 'ADMIN') {
        return 'MECHANIC';
    }
    return normalized;
};

const isValidRatingType = (ratingType) => {
    return ['MECHANIC', 'SYSTEM'].includes(normalizeRatingType(ratingType));
};

const baseWhere = {
    ratingType: {
        in: ['MECHANIC', 'SYSTEM', 'ADMIN']
    }
};

const mapRating = (rating) => ({
    ...rating,
    ratingType: normalizeRatingType(rating.ratingType)
});

const avgAndCount = (items) => {
    if (items.length === 0) {
        return { average: 0, count: 0 };
    }
    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    return {
        average: parseFloat((totalScore / items.length).toFixed(1)),
        count: items.length
    };
};

const submitRating = async (req, res) => {
    try {
        const { ratingType, score, comment } = req.body;
        const customerId = req.user.id;

        if (!isValidRatingType(ratingType)) {
            return res.status(400).json({ error: 'Invalid rating type. Must be MECHANIC or SYSTEM.' });
        }

        const parsedScore = parseScore(score);
        if (!parsedScore) {
            return res.status(400).json({ error: 'Score must be between 1 and 5.' });
        }

        const rating = await prisma.rating.create({
            data: {
                ratingType: normalizeRatingType(ratingType),
                score: parsedScore,
                comment: comment ? String(comment).trim() : null,
                customerId
            }
        });

        res.status(201).json({ message: 'Rating submitted successfully', rating: mapRating(rating) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyRatings = async (req, res) => {
    try {
        const customerId = req.user.id;
        const ratings = await prisma.rating.findMany({
            where: { customerId, ...baseWhere },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings.map(mapRating));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllRatings = async (req, res) => {
    try {
        const { type } = req.query;
        const normalizedType = normalizeRatingType(type);

        const ratings = await prisma.rating.findMany({
            where: {
                ...baseWhere,
                ...(isValidRatingType(type) ? { ratingType: normalizedType } : {})
            },
            include: {
                customer: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(ratings.map(mapRating));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRatingSummary = async (req, res) => {
    try {
        const rawRatings = await prisma.rating.findMany({
            where: baseWhere,
            select: { score: true, ratingType: true }
        });

        const allRatings = rawRatings.map((rating) => ({
            score: rating.score,
            ratingType: normalizeRatingType(rating.ratingType)
        }));

        const mechanicRatings = allRatings.filter((rating) => rating.ratingType === 'MECHANIC');
        const systemRatings = allRatings.filter((rating) => rating.ratingType === 'SYSTEM');
        const mechanic = avgAndCount(mechanicRatings);
        const system = avgAndCount(systemRatings);
        const total = mechanic.count + system.count;

        res.json({
            mechanic,
            system,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitRating, getMyRatings, getAllRatings, getRatingSummary };
