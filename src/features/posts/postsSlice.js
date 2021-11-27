import { createSlice, nanoid, createAsyncThunk  } from '@reduxjs/toolkit'
import { client } from '../../api/client'

//The word "thunk" is a programming term that means "a piece of code that does some delayed work".

const initialState = {
    posts: [],
    status: 'idle',
    error: null
}
// createAsyncThunk accepts two arguments 1. A string that will be used as the prefix fo the generated action types 2. A payload creator callback function that should return a Promise containing some data, or a rejected Promise with an error
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () =>{
    const response = await client.get('/fakeApi/posts')
    return response.data
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async initialPost =>{
    const response = await client.post('/fakeApi/posts', initialPost)
    return response.data
})
//However there are times when a slice reducer needs to respond to other actions that weren't defined as the part of this slice's reducers field, we can do that using the slice extraReducers field instead 
// The extraReducers option should be a function that receives a parameter called builder builder.addCase(actionCreator, reducer) to handle each of the actions displayed by our async thunks
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            user: userId,
            reactions: {
              thumbsUp: 0,
              hooray: 0,
              heart: 0,
              rocket: 0,
              eyes: 0,
            },
          },
        }
      },
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  },
  extraReducers(builder) {
      builder.addCase(fetchPosts.pending, (state, action)=>{
          state.status = 'loading'
      }).addCase(fetchPosts.fulfilled, (state, action) =>{
          state.status='succeeded'
          state.posts = state.posts.concat(action.payload)
      }).addCase(fetchPosts.rejected,(state,action)=>{
          state.status = 'failed'
          state.error = action.error.message
      }).addCase(addNewPost.fulfilled,(state, action) =>{
          state.posts.push(action.payload)
      })
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

export const selectAllPosts = state => state.posts.posts
export const selectPostById = (state, postId) => state.posts.posts.find(post => post.id === postId)