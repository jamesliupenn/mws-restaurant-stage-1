/* eslint-disable */

// Restaurant API CRUD Handlers
class Api {
	static updateIsFavorite(id, state) {
		const URL = 'http://localhost:1337/restaurants/' + id + '/?is_favorite=' + state;
		fetch(URL, {
    		method: 'PUT',
		    headers: {
				'Content-Type': 'application/json'
		    }
		}).then(res => res.json());
	}

	static setReview(id, name, review, rating) {
		const URL = 'http://localhost:1337/reviews/';
		let payload = {
			restaurant_id: id,
			name: name,
			rating: rating,
			comments: review
		};
		fetch(URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		}).then(res => res.json());
		window.location.reload();
	}
}