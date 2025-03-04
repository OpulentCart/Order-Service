const { Sequelize } = require("sequelize");
const sequelize = require("../config/db"); // Sequelize instance

exports.getVendorUserId = async (product_id) => {
    try {
        const [result] = await sequelize.query(
            `SELECT v.user_id 
             FROM vendors v
             JOIN product p ON v.vendor_id = p.vendor_id
             WHERE p.product_id = :product_id`,
            { replacements: { product_id }, type: Sequelize.QueryTypes.SELECT }
        );

        return result ? result.user_id : null;
    } catch (error) {
        console.error("❌ Error fetching vendor user_id:", error.message);
        return null;
    }
};
