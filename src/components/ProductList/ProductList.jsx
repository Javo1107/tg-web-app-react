import React, {useState} from 'react';
import './ProductList.css';
import ProductItem from "../ProductItem/ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";

import axios from 'axios';
import Button from '../Button/Button';

const products = [
    {id: '1', title: 'Jeans', price: 5000, description: 'Color blue, straight'},
    {id: '2', title: 'Jacket', price: 12000, description: 'Color green, puffy'},
    {id: '3', title: 'Jeans 2', price: 5000, description: 'Color blue, skinny'},
    {id: '4', title: 'Jacket 8', price: 122, description: 'Color green, puffy'},
    {id: '5', title: 'Jeans 3', price: 5000, description: 'Color blue, skinny'},
    {id: '6', title: 'Jacket 7', price: 600, description: 'Color green, puffy'},
    {id: '7', title: 'Jeans 4', price: 5500, description: 'Color blue, skinny'},
    {id: '8', title: 'Jacket 5', price: 12000, description: 'Color green, puffy'},
]

const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

const ProductList = () => {
    const [addedItems, setAddedItems] = useState([]);
    const {tg, queryId, user} = useTelegram();

    const onSendData = useCallback(async () => {
        const data = {
            products: addedItems,
            totalPrice: getTotalPrice(addedItems),
            queryId,
            chatId: user.id,
        };
    
        try {
            await axios.post('https://b379-93-188-83-203.ngrok-free.app/web-data', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            tg.showAlert(`Error: ${error.message}`);
            console.error('Error:', error);
        }
    }, [addedItems, queryId]);

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    const onAdd = (product) => {
        const alreadyAdded = addedItems.find(item => item.id === product.id);
        let newItems = [];

        if(alreadyAdded) {
            newItems = addedItems.filter(item => item.id !== product.id);
        } else {
            newItems = [...addedItems, product];
        }

        setAddedItems(newItems)

        if(newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Total ${getTotalPrice(newItems)}`
            })
        }
    }

    return (
        <div className={'list'}>
            {products.map(item => (
                <ProductItem
                    product={item}
                    onAdd={onAdd}
                    className={'item'}
                />
            ))}
        </div>
    );
};

export default ProductList;
