import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface AIMessage {
  from: "user" | "ai";
  text: string;
}

interface AIState {
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: AIState = {
  messages: [
    { from: "ai", text: "Hello! How can I help you with your health today?" },
  ],
  loading: false,
  error: null,
};

export const sendAIMessage = createAsyncThunk(
  "ai/sendMessage",
  async (text: string, { rejectWithValue }) => {
    try {
      const res = await api.post("/ai/consult", { text });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "AI chat failed");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ from: "user", text: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAIMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAIMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({ from: "ai", text: action.payload });
      })
      .addCase(sendAIMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage } = aiSlice.actions;
export default aiSlice.reducer; 