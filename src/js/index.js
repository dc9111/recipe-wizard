import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as SearchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';



/* Global state
- Search Object
- Current Recipe object
- Liked Recipes
*/

const state = {};

const controlSearch = async () => {
    // 1. Get Query from view
    const query = SearchView.getInput();// to do 

    if (query) {
        //2) New Search Object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        SearchView.clearInput();
        SearchView.clearResults();
        renderLoader(elements.searchRes);
        //4) Search for recipes 
        await state.search.getResults();

        // 5). Render Results on UI
        clearLoader();
        SearchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        SearchView.clearResults();
        SearchView.renderResults(state.search.result, goToPage);
    }

});

/* Recipe Controller */

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Hightlight selected item
        if (state.search) SearchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);

        //Get recipe data
        try { 
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();             

        //Calc servings and times 
        state.recipe.calcTime();
        state.recipe.calcServings();

        //Render Recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );

        } catch (err) {

        }


    }

}

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

//LIST Controller

const controlList = () => {
    //create a new list if there isn't one
    if (!state.list) state.list = new List();

    //add each ingredient
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// Handle delete update list item events

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

// LIKE CONTROLLER

state.likes - new Likes();

const controlLike = () => {
    if (!state.likes) state.likes = new Likes; 
    const currentID = state.recipe.id;

    if (!state.likes.isLiked(currentID)) {
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        likesView.toggleLikeBtn(true);

        likesView.renderLike(newLike);
    } else {
        state.likes.deleteLike(currentID);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

// Handling Recipe buttons clicks

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease is clicked
        if (state.recipe.servings > 1) {
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) { 
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add', '.recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }

});
