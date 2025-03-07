const { Sequelize, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig"); // Sequelize instance

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

exports.getOrCreateAddress = async (street, city, state, country, pincode) => {
    try {
        const query = `
            INSERT INTO address (street, city, state, country, pincode, "createdAt", "updatedAt")
            SELECT :street, :city, :state, :country, :pincode, NOW(), NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM address
                WHERE street = :street AND city = :city 
                AND state = :state AND country = :country 
                AND pincode = :pincode
            )
            RETURNING address_id;
        `;

        // Execute the query
        const [result] = await sequelize.query(query, {
            replacements: { street, city, state, country, pincode },
            type: QueryTypes.INSERT // Fixed QueryTypes
        });

        if (result.length > 0) {
            console.log("✅ Address found or created. Returning address_id:", result[0].address_id);
            return result[0].address_id;
        }

        // If no new insertion happened, fetch the existing address_id
        const [existing] = await sequelize.query(
            `SELECT address_id FROM address 
             WHERE street = :street AND city = :city 
             AND state = :state AND country = :country 
             AND pincode = :pincode`, 
            {
                replacements: { street, city, state, country, pincode },
                type: QueryTypes.SELECT
            }
        );

        console.log("✅ Returning existing address_id:", existing.address_id);
        return existing.address_id;

    } catch (error) {
        console.error("❌ Error in getOrCreateAddress:", error.message);
        throw error;
    }
};

exports.getOrderedProductsForVendorUser = async (user_id) => {
    try {
        console.log("✅ User ID received in SQL query:", user_id, "Type:", typeof user_id);

        const results = await sequelize.query(
            `SELECT oi.order_item_id, oi.status, oi.quantity, 
                    p.product_id, p.name AS product_name, p.price, 
                    o.order_id, o.user_id AS customer_id
             FROM order_items oi
             JOIN product p ON oi.product_id = p.product_id
             JOIN public."order" o ON oi.order_id = o.order_id
             JOIN vendors v ON p.vendor_id = v.vendor_id
             WHERE v.user_id = :user_id`,
            {
                replacements: { user_id },  // Ensure user_id is correctly passed
                type: QueryTypes.SELECT,
            }
        );

        return results;
    } catch (error) {
        console.error("❌ SQL Query Error:", error.message);
        return [];
    }
};



