import React, {useState} from 'react';
import './ProductList.css';
import ProductItem from "../ProductItem/ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";

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
    const {tg, queryId} = useTelegram();
    
    console.log("in productlist");

    const onSendData = useCallback(() => {
        
        const data = {
            products: addedItems,
            totalPrice: getTotalPrice(addedItems),
            queryId,
        };
    
        fetch('http://3.25.146.155:8000/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            
            if (!response.ok) {
                tg.showAlert(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tg.showAlert("Success");
            console.log('Success:', data);
        })
        .catch(error => {
            //tg.showAlert(error);
            console.error('Error:', error);
        });
    }, [addedItems, queryId]);

    useEffect(() => {
        //tg.onEvent('mainButtonClicked', onSendData)
        tg.MainButton.onClick(onSendData);
        return () => {
            tg.MainButton.offClick(onSendData);
            //tg.offEvent('mainButtonClicked', onSendData)
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
                text: `Purchase ${getTotalPrice(newItems)}`
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
