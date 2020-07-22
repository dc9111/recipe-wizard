import Search from './models/Search';
import Recipe from './models/Recipe';
import * as SearchView from './views/searchView';
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

const r = new Recipe(47746);
r.getRecipe();
console.log(r);