const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');
const Order = require("../models/order");

const OrderItems = sequelize.define('OrderItems', {
    order_item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'order',
            key: 'order_id'
        },
        onDelete: 'CASCADE'
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product',
            key: 'product_id'
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false   
    }
}, {
    tableName: 'order_items',
    timestamps: true
});

Order.hasMany(OrderItems, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderItems.belongsTo(Order, { foreignKey: "order_id" });

sequelize.sync({ alter: true})
    .then(() => {
        console.log("Order Items table created")
    })
    .catch(err => console.error("❌ Error creating Order Items table:", err));

module.exports = OrderItems;
