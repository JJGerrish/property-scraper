import React from 'react'
import Layout from '../components/Layout'
import fetch from 'isomorphic-unfetch'
import cheerio from 'cheerio';
import '../sass/main.scss';

function formatPrice(price) {
    console.log(price);
    return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function checkGoodAveragePrice(queryPrice, averagePrice) {
    return parseFloat(queryPrice) < parseFloat(averagePrice);
}

function calculateAveragePrice(properties) {

    let numberOfProperties = properties.length;
    let totalPropertiesPrice = 0;

    properties.forEach(property => totalPropertiesPrice += property.price);
    
    let averagePropertyPrice = totalPropertiesPrice / numberOfProperties;
    let roundedAveragePropertyPrice = averagePropertyPrice.toFixed(2);

    return roundedAveragePropertyPrice;
}

function getProperties(html) {

    const $ = cheerio.load(html);

    const propertiesList = $('.listing-results li.srp:not(.premium-listing)');

    // maybe map properties to an object with needed variables e.g. price, bedrooms, etc...
    // e.g. 
    let properties = propertiesList.map(function() {

        let priceText = $(this).find('.listing-results-price').text();
        let cleanPrice = priceText.replace(/\s/g, "");;
        let priceNumber = cleanPrice.replace(/\D/g,'');

        return {
            price: parseInt(priceNumber)
        }
    });

    let filteredProperties = Array.from(properties).filter(property => !isNaN(property.price));

    return filteredProperties;
}

const Home = ({data, postcode, price, bedrooms, type}) => {
    
    const properties = getProperties(data);
    const averagePropertyPrice = calculateAveragePrice(properties);
    const formattedAveragePropertyPrice = formatPrice(averagePropertyPrice);
    const formattedPrice = price ? formatPrice(price) : '';
    const goodAveragePrice = checkGoodAveragePrice(price, averagePropertyPrice);

    return (
        <Layout>
            <section className="app">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="app__container">
                                <div className="app__header">
                                    <h1>Average Property Price Calculator</h1>
                                </div>
                                <div className="app__body">
                                    <div className="app__form">
                                        <form className="form" action="/">
                                            <input className="js-postcode" type="text" name="postcode" placeholder="Postcode" defaultValue={postcode} required></input>
                                            <input className="js-price" type="text" name="price" placeholder="Price" defaultValue={price} required></input>
                                            <input className="js-bedrooms" type="text" name="bedrooms" placeholder="No. of Bedrooms" defaultValue={bedrooms} required></input>
                                            <select className="js-house-type" name="type" defaultValue={type} required>
                                                <option value="terraced">Terraced</option>
                                                <option value="semi_detached">Semi-detached house</option>
                                                <option value="detached">Detached house</option>
                                            </select>
                                            <button className="button" type="submit">Calculate</button>
                                        </form>
                                    </div>
                                    {properties.length !== 0 &&
                                        <div className="app__result">
                                            <p>The average price for a {bedrooms} bedroom, {type} house in {postcode} is</p>
                                            <p className={"result " + (goodAveragePrice === true ? 'green' : 'red')}><span>£{formattedAveragePropertyPrice}</span></p>
                                            <p>which is {goodAveragePrice === true ? 'less than' : 'more than'} your price of £{formattedPrice}</p>
                                            <p className="note">Calculated from {properties.length} similar properties.</p>
                                        </div> 
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    )
};

Home.getInitialProps = async function({query}) {

    // console.log(query);

    const { postcode, price, bedrooms, type} = query;

    // check if query is empty or not
    // if not empty:



    const res = await fetch(`https://www.zoopla.co.uk/for-sale/houses/${bedrooms}-bedrooms/${postcode}/?page_size=100&property_sub_type=${type}&q=${postcode}&radius=0&results_sort=newest_listings&search_source=facets`);
    const data = await res.text();

    return { data, postcode, price, bedrooms, type };
}

// inputs:
// - post code
// - price
// - bedrooms
// - house type (e.g. detached)


export default Home
