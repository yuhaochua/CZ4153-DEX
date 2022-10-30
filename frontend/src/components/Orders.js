import { useState } from "react";
import { useEffect } from "react";

const Orders= ({addr, orders}) => {
    const [buyOrders, setBuyOrders] = useState([])
    const [sellOrders, setSellOrders] = useState([])

    useEffect(() => {
        const filterOrders = () => {
            let buy_Orders = [] // temp array to hold the buy orders
            let sell_Orders = [] // temp array to hold the sell orders
            console.log("filtering orders", orders)
            orders && orders.map(order => {
                console.log("ordered By",order.orderedBy)
                if(order.orderedBy === addr){
                    if(order.orderType == 'buy') {
                        buy_Orders.push({
                            price: order.price,
                            quantity: order.quantity,
                            token1: order.token1,
                            token2: order.token2
                        })
                        setBuyOrders(buy_Orders)
                    } else {
                        sell_Orders.push({
                            price: order.price,
                            quantity: order.quantity,
                            token1: order.token1,
                            token2: order.token2
                        })
                        setSellOrders(sell_Orders)
                    }
                }
            })
        }
        filterOrders()
    }, [orders])

    return (
        <div className="row">
            {buyOrders && buyOrders.map(order => (
                <span>Buy {order.quantity} {" "} {order.token2} for {order.price} {" "} {order.token1}</span>
            ))}
            {sellOrders && sellOrders.map(order => (
                <span>Sell {order.quantity} {" "} {order.token2} for {order.price} {" "} {order.token1}</span>
            ))}
        </div>
    );
};

export default Orders;
