const { Datatypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const Order = sequelize.define('Order', {
    order_id : {
        type: Datatypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Datatypes.INTEGER,
        allowNull: false,
        references: {
            model: 'auth_app_customuser',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    total_amount: {
        type: Datatypes.INTEGER,
        allowNull: false
    },
    status: {
        type: Datatypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },
    delivery_date: {
        type: Datatypes.DATE,
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