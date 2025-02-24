const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Order = sequelize.define('Order', {
    order_id : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'auth_app_customuser',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'order',
    timestamps: true
});

sequelize.sync({ alter: true})
    .then(() => {
        console.log("Order table created")
    })
    .catch(err => console.error("❌ Error creating Order table:", err));

module.exports = Order;