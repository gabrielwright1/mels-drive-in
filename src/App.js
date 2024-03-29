// styling
import "./styles/sass/App.scss";

// modules
import { useEffect, useState } from "react";
import {
	getDatabase,
	ref,
	onValue,
	push,
	remove,
	get,
	update,
} from "firebase/database";

// config
import firebase from "./firebase";

// components
import Modal from "./components/Modal";
import Footer from "./components/Footer";
import ContentWrapper from "./components/ContentWrapper";

function App() {
	// state
	const [burgerProducts, setBurgerProducts] = useState([]);
	const [total, setTotal] = useState(0);
	const [burgers, setBurgers] = useState([]);
	const [modalBurger, setModalBurger] = useState("");

	// query firebase and get the burger products
	useEffect(() => {
		const totalId = "-N0yHl4A1PhHDEClucsy";

		const database = getDatabase(firebase);
		const productRef = ref(database, `/products/`);
		const cartRef = ref(database, `/cart/`);
		const totalRef = ref(database, `/total/${totalId}`);

		// grab the product list
		onValue(productRef, (response) => {
			const burgerProductArr = [];
			const data = response.val();
			for (let key in data) {
				// push the data as well as the key into the new array
				burgerProductArr.push({ ...data[key], key: key });
			}
			// update state
			setBurgerProducts(burgerProductArr);
		});

		// grab the cart list
		onValue(cartRef, (response) => {
			const burgerCartArr = [];
			const data = response.val();
			for (let key in data) {
				// push the data as well as the key into the new array
				burgerCartArr.push({ ...data[key], key: key });
			}
			// update state
			setBurgers(burgerCartArr);
		});

		// update local state to the total stored in database
		get(totalRef).then((snapshot) => {
			setTotal(snapshot.val().cartTotal);
		});
	}, []);

	useEffect(() => {
		if (total !== 0) {
			// only update database if the local total isn't its on-mount value of 0
			updateTotalInDb({ cartTotal: total });
		}
	}, [total]);

	const updateTotalInDb = (totalObj) => {
		const database = getDatabase(firebase);
		const totalRef = ref(database, `/total/-N0yHl4A1PhHDEClucsy`);
		return update(totalRef, totalObj);
	};

	const addListItems = (burgerObj) => {
		// update total in shopping cart
		const { subtotal } = burgerObj;
		setTotal(total + subtotal);

		// add burger object to database
		const database = getDatabase(firebase);
		const cartRef = ref(database, `/cart/`);

		// add items to cart in database
		push(cartRef, burgerObj);
	};

	const handleRemove = (burgerId, subtotal) => {
		const database = getDatabase(firebase);
		const cartRef = ref(database, `/cart/${burgerId}`);

		// update total in shopping cart
		setTotal(total - subtotal);

		// remove from database
		remove(cartRef);

		// if its the last item in the cart, then clear the database total
		if (burgers.length === 1) {
			updateTotalInDb({ cartTotal: 0 });
		}
	};

	const clearCartInDb = () => {
		// reset database cart
		const database = getDatabase(firebase);
		const cartRef = ref(database, `/cart/`);

		remove(cartRef);
	};

	const handleCheckout = (event) => {
		event.preventDefault();

		// confirmation message
		alert("Thank you for your purchase!");

		// reset local state
		setBurgers([]);
		setTotal(0);

		// reset database total
		updateTotalInDb({ cartTotal: 0 });

		// reset cart in database
		clearCartInDb();
	};

	const handleModalOpen = (burgerProduct) => {
		// open the modal
		const modalElem = document.querySelector("#modal");
		// make modal visible
		modalElem.style.display = "block";
		// update burger name state
		const { name } = burgerProduct;
		setModalBurger(name);
	};

	return (
		<div className="App">
			<Modal modalBurger={modalBurger} />
			<ContentWrapper
				burgers={burgers}
				total={total}
				burgerProducts={burgerProducts}
				addListItems={addListItems}
				handleRemove={handleRemove}
				handleCheckout={handleCheckout}
				handleModalOpen={handleModalOpen}
			/>
			<Footer />
		</div>
	);
}

export default App;
