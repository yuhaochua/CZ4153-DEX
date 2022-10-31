import { useState } from "react";
import { useEffect } from "react";
import { DeleteOutlined } from '@ant-design/icons';
import { cancelBuy, cancelSell } from '../Dex.js';

const Orders= ({addr, orders, refreshHandler, refreshOrders}) => {
    const [buyOrders, setBuyOrders] = useState([])
    const [sellOrders, setSellOrders] = useState([])

    const handleCancelBuy = async(e, token1, token2, index) => {
        e.preventDefault()
        console.log("token1: ", token1)
        console.log("token2: ", token2)
        await cancelBuy(token1, token2, addr)
        buyOrders.splice(index, 1)
        setBuyOrders(buyOrders)
        refreshHandler()
    }

    const handleCancelSell = async(e, token1, token2, index) => {
        e.preventDefault()
        await cancelSell(token1, token2, addr)
        sellOrders.splice(index, 1)
        setSellOrders(sellOrders)
        refreshHandler()
    }

    useEffect(() => {
        console.log("inside ORders", orders)
        const filterOrders = () => {
            let buy_Orders // temp array to hold the buy orders
            let sell_Orders // temp array to hold the sell orders
            console.log("filtering orders", orders)
            buy_Orders = []
            sell_Orders = []
            orders && orders.map(order => {
                console.log("ordered By",order.orderedBy)
                if(order.orderedBy === addr){
                    if(order.orderType === 'buy') {
                        buy_Orders.push({
                            price: order.price,
                            quantity: order.quantity,
                            token1: order.token1,
                            token2: order.token2,
                            token1Addr: order.token1Addr,
                            token2Addr: order.token2Addr
                        })
                        setBuyOrders(buy_Orders)
                    } else {
                        sell_Orders.push({
                            price: order.price,
                            quantity: order.quantity,
                            token1: order.token1,
                            token2: order.token2,
                            token1Addr: order.token1Addr,
                            token2Addr: order.token2Addr
                        })
                        setSellOrders(sell_Orders)
                    }
                }
            })
        }
        filterOrders()
    }, [orders.length, refreshOrders])

    return (
        <div className="row">
            {buyOrders && buyOrders.map((order, index) => (
                <div className="d-flex">
                    <span>Buy {order.quantity} {" "} {order.token2} for {order.price} {" "} {order.token1}</span> 
                    <DeleteOutlined
                        className="mt-1"
                        onClick={(e) => handleCancelBuy(e, order.token1Addr, order.token2Addr, index)}
                        style={{color: "red"}}
                    />
                </div>
            ))}
            {sellOrders && sellOrders.map((order, index) => (
                <div className="d-flex">
                    <span>Sell {order.quantity} {" "} {order.token2} for {order.price} {" "} {order.token1}</span>
                    <DeleteOutlined
                        className="mt-1"
                        onClick={(e) => handleCancelSell(e, order.token1Addr, order.token2Addr, index)}
                        style={{color: "red"}}
                    />
                </div>
            ))}
        </div>
    );
};

export default Orders;
