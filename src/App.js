import React, { Component } from 'react';
import './App.css';
import { Menu, Dropdown, Card, Button, Icon, Input } from 'antd';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'

const request = require('request');

class App extends Component {
  constructor () {
    super();

    this.state = {
        inventories: [],
        shoppingCart: [],
        filterCategory: ""
    }

    this.addToCardClick = this.addToCardClick.bind(this);
    this.deleteButtonClick = this.deleteButtonClick.bind(this);
    this.categoryClick = this.categoryClick.bind(this);
    this.sortByPriceOnClick = this.sortByPriceOnClick.bind(this);
  }

  componentDidMount() {
    let callBack = function (error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the Google homepage.

      const inventories = JSON.parse(body);
      console.log("Print the response:");
      console.log(inventories);

      this.setState({
        inventories
      });


    };

    callBack = callBack.bind(this);

    request('http://demo7687977.mockable.io/inventory', callBack);
  }

  sortByPriceOnClick() {
      const { inventories } = this.state;
      inventories.sort((item1, item2) => item1.price - item2.price);
      this.setState({ inventories });
  }

  deleteButtonClick(index) {
    console.log("index: " + index);
    const { shoppingCart } = this.state;
    shoppingCart.splice(index, 1);

    console.log(shoppingCart);

    this.setState({
      shoppingCart
    });
  }

  categoryClick(filterCategory) {
    this.setState({filterCategory});
  }

  addToCardClick(index, itemId) {
    let cnt = document.getElementById(itemId).value;

    const { shoppingCart, inventories } = this.state;

    const item = inventories[index];

    console.log("cnt: " + cnt);
    if (isNaN(cnt) || cnt > item.inventory || cnt <= 0) {
      return;
    }

    cnt = parseInt(cnt);

    item.inventory -= cnt;
    let update = false;
    for (let i = 0; i < shoppingCart.length; i++) {
      // console.log("the id: " + item.id);
      if (shoppingCart[i].id === item.id) {
        shoppingCart[i].number = cnt + parseInt(shoppingCart[i].number);
        update = true;
        break;
      }
    }

    if (!update) {
        item.number = cnt;
        shoppingCart.push(item);
    }

    this.setState({
      shoppingCart
    });
  }

  render() {
    const { filterCategory, inventories, shoppingCart } = this.state;

    let index = 0;

    const categories = {};

    const allCategories = "All Categories";
    categories[allCategories] = allCategories;

    const inventoryList = inventories.map(item => {
      let inputNum = React.createRef();
      categories[item.category] = item.category;

      if (filterCategory && item.category !== filterCategory
          && filterCategory !== allCategories) {
        return null;
      }

      return (
        <Card
          key={ item.id }
          className='item'
          title={ item.name }
          bordered={ true }
        >
          <table>
            <tbody>
              <tr>
                <td>Category:</td>
                <td>{ item.category }</td>
              </tr>
              <tr>
                <td>Price:</td>
                <td>{ item.price }</td>
              </tr>
              <tr>
                <td>Inventory:</td>
                <td>{ item.inventory }</td>
              </tr>
            </tbody>
          </table>

          <label>QTY:</label>
          <Input
            id={ item.id }
            ref={ inputNum }>
          </Input>
          <Button onClick={ this.addToCardClick.bind(null, index++, item.id) } type="primary">
            Add to cart
          </Button>
        </Card>
      );
    });

    index = 0;

    let priceSum = 0;
    let taxSum = 0;

    const shoppingList = shoppingCart.map(item => {
      const price = item.price * item.number;
      priceSum += price;

      if (item.category !== "Service") {
        taxSum += price * 0.15;
      }

      return (
        <Card
          key={ item.id }
          className='item'
          title={ item.name }
          bordered={ true }
        >
          <table>
            <tbody>
              <tr>
                <td>Total Price:</td>
                <td>{ price }</td>
              </tr>
              <tr>
                <td>QTY:</td>
                <td>{ item.number }</td>
              </tr>
            </tbody>
          </table>
          <Button
            onClick={ this.deleteButtonClick.bind(null, index++) }
            type="primary"
            className="delete-button"
          >
            Delete item
          </Button>
        </Card>
      );
    });

    const categoriesArr = Object.values(categories);

    const menu = (
      <Menu>
        { categoriesArr.map(item =>
            <Menu.Item key={ item }>
              <a
                onClick={ this.categoryClick.bind(null, item) }
                href="#"
              >
                { item }
              </a>
            </Menu.Item>
          )
        }
      </Menu>
    );

    return (
      <div className="App">
        <header className="App-header">
        </header>

        <div className='content'>
          <div className='inventory'>
            <h1>Inventory</h1>
            <div className="headerSection">
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link" href="#">
                  Filter Category <Icon type="down" />
                </a>
              </Dropdown>
              <Button className="sort-by-price" onClick={ this.sortByPriceOnClick } >
                Sort by price
              </Button>
            </div>
            { inventoryList }
          </div>

          <div className='shopping-cart'>
            <h1>Shopping Cart</h1>
            { shoppingList }
            <Card className='item order-summary'>
              <Icon type="dollar" theme="outlined" className="dollar-icon"/>
              <h3>Order Summary</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Items:</td>
                    <td>{ priceSum }</td>
                  </tr>
                  <tr>
                    <td>Estimated tax to be collected:</td>
                    <td>{ taxSum }</td>
                  </tr>
                  <tr className='order-total'>
                    <td><h4>Order total:</h4></td>
                    <td><h4>{ taxSum + priceSum }</h4></td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
