let product = "Socks";
let eventBus = new Vue()


Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
    <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
        <span v-if="nameError" class="error">{{ nameError }}</span>
    </p>

    <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
    </p>

    <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
        </select>
    </p>
    <p>
        <label for="recommend">Would you recommend this product?</label>
        <label>
            <input type="radio" id="yes" name="recommend" value="yes" v-model="recommend"> Yes
        </label>
        <label>
            <input type="radio" id="no" name="recommend" value="no" v-model="recommend"> No
        </label>
    </p>
    <p>
        <input type="submit" value="Submit" :disabled="nameError"> 
    </p>
    </form>
  `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: [],
            nameError: null
        }
    },
    watch: {
        async name(newName) {
            if (!newName) {
                this.nameError = "Name required.";
                return;
            }
            
            let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
            let nameExists = reviews.some(review => review.name === newName);


            if (nameExists) {
                this.nameError = "This name is already taken.";
            } else {
                this.nameError = null;
            }
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];

            if (!this.name) this.errors.push("Name required.");
            if (!this.review) this.errors.push("Review required.");
            if (!this.rating) this.errors.push("Rating required.");
            if (this.recommend === null) this.errors.push("Recommend selection is required.");
            if (this.nameError) return;

            if (!this.errors.length) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend === "yes" ? "yes" : "no"
                }

                let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
                reviews.push(productReview);
                localStorage.setItem("reviews", JSON.stringify(reviews));

                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
            }
        }
    }
})

 

 Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>   
      <ul>
        <span class="tab"
              :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs"
              @click="selectedTab = tab"
              >{{ tab }}</span>
      </ul>
        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews" :key="review.name">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    <p>{{ review.recommend }}</p>
                </li>
            </ul>
        </div>
        <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
        </div>
        <div v-show="selectedTab === 'Shipping'">
        <p>Shipping Cost: {{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
        </div>
      </div>
    `,
    data() {
        return {
            tabs: ["Reviews", "Make a Review", "Shipping", "Details"],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    }
 }) 
 


 Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
 
    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText" />
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <p v-if="inStock > 10">In stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p id="out_of_stock" v-else>Out of stock</p>
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <p>Shipping: {{ shipping }}</p>
        <div
            class="color-box"
            v-for="(variant, index) in variants"
            :key="variant.variantId"
            :style="{ backgroundColor:variant.variantColor }"
            @mouseover="updateProduct(index)"
        >
        </div>
        
        <div class="button-container">
            <button
            v-on:click="addToCart"
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
            Add to cart
            </button>
            <button v-on:click="removeFromCart">Remove from cart</button>
        </div>
        <a :href="link" id="link" > More products like this</a>
        
        <product-tabs :reviews="reviews"></product-tabs>
    </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 100
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: [] // Загружаем из localStorage
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
         
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
    },
    mounted() {
        
        let savedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        this.reviews = savedReviews;
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
            localStorage.setItem("reviews", JSON.stringify(this.reviews)); // Сохраняем обновленный список
        });
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        shipping() {
            return this.premium ? "Free" : 2.99;
        }
    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            let index = this.cart.indexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1); 
            }
        }
     }
     
})