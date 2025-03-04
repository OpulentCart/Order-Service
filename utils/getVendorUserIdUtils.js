const { Sequelize } = require("sequelize");
const sequelize = require("../config/dbConfig");

async function getVendorUserId(productId) {
    try {
        const query = `
            SELECT v.user_id 
            FROM product p
            JOIN vendors v ON p.vendor_id = v.vendor_id
            WHERE p.product_id = :productId
        `;

        const result = await sequelize.query(query, {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { productId },
        });

        return result.length > 0 ? result[0].user_id : null;
    } catch (error) {
        console.error("❌ Error fetching vendor user_id:", error);
        return null;
    }
}
