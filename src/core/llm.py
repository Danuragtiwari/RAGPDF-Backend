import ollama

def generate_answer(query, context_chunks):
    # Combine chunks into a single string
    context = "\n".join(context_chunks)
    
    # Construct the message for the chat API
    prompt = f"Answer the question based on context:\nContext:\n{context}\nQuestion:\n{query}"
    
    # Call the chat function directly from the module
    response = ollama.chat(
        model="llama3.2",
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    # Return the content of the message
    print(response)  # Debugging line to see the full response
    return response['message']['content']