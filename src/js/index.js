import Search from './models/Search';
import Recipe from './models/Recipe';
import * as SearchView from './views/searchView';
import * as recipeView from './views/recipeView';
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
        recipeView.renderRecipe(state.recipe);
        console.log(recipe)

        } catch (err) {
            alert('Error processing recipe')
        }


    }

}

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

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
    }
    console.log(state.recipe)
});