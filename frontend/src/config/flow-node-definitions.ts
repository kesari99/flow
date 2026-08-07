import {
  Bot,
  Code,
  GitBranch,
  Globe,
  MessageSquare,
  Scissors,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  AIFlowNodeCategory,
  AIFlowNodeType,
  NodeFieldType,
  type NodeCategoryGroup,
  type NodeDefinition,
} from "@/schemas/flow-node.schema";

export const NODE_ICONS: Record<AIFlowNodeType, LucideIcon> = {
  [AIFlowNodeType.ChatInput]: MessageSquare,
  [AIFlowNodeType.ChatOutput]: MessageSquare,
  [AIFlowNodeType.OpenAiLlm]: Bot,
  [AIFlowNodeType.AnthropicLlm]: Bot,
  [AIFlowNodeType.ChromaRetriever]: Search,
  [AIFlowNodeType.PineconeRetriever]: Search,
  [AIFlowNodeType.PythonTool]: Code,
  [AIFlowNodeType.HttpTool]: Globe,
  [AIFlowNodeType.TextSplitter]: Scissors,
  [AIFlowNodeType.TextCombiner]: Scissors,
  [AIFlowNodeType.Conditional]: GitBranch,
};

export const CATEGORY_COLORS: Record<AIFlowNodeCategory, string> = {
  [AIFlowNodeCategory.Input]:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [AIFlowNodeCategory.Output]:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  [AIFlowNodeCategory.Llm]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [AIFlowNodeCategory.Retrieval]:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  [AIFlowNodeCategory.Tools]:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  [AIFlowNodeCategory.Processing]:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export const NODE_DEFINITIONS: Record<AIFlowNodeType, NodeDefinition> = {
  [AIFlowNodeType.ChatInput]: {
    label: "Chat Input",
    description: "Receive user message input",
    category: AIFlowNodeCategory.Input,
    defaultFields: [],
    defaultConfig: {},
    inputs: [],
    outputs: [{ id: "message", label: "Message" }],
  },
  [AIFlowNodeType.ChatOutput]: {
    label: "Chat Output",
    description: "Send response to user",
    category: AIFlowNodeCategory.Output,
    defaultFields: [],
    defaultConfig: {},
    inputs: [{ id: "response", label: "Response" }],
    outputs: [],
  },
  [AIFlowNodeType.OpenAiLlm]: {
    label: "OpenAI LLM",
    description: "Call OpenAI GPT models",
    category: AIFlowNodeCategory.Llm,
    defaultFields: [
      {
        key: "model",
        label: "Model",
        type: NodeFieldType.Select,
        value: "gpt-4o-mini",
        options: [
          { label: "GPT-4o Mini", value: "gpt-4o-mini" },
          { label: "GPT-4o", value: "gpt-4o" },
          { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { label: "GPT-4", value: "gpt-4" },
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
        description: "Select the OpenAI model",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: NodeFieldType.Number,
        value: 0.7,
        placeholder: "0.0 - 2.0",
        description: "Controls randomness",
      },
      {
        key: "max_tokens",
        label: "Max Tokens",
        type: NodeFieldType.Number,
        value: 2048,
        description: "Maximum tokens to generate",
      },
      {
        key: "system_message",
        label: "System Prompt",
        type: NodeFieldType.Textarea,
        value: "You are a helpful assistant.",
        placeholder: "Enter system prompt...",
        description: "Instructions for the AI assistant",
      },
    ],
    defaultConfig: {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2048,
      system_message: "You are a helpful assistant.",
    },
    inputs: [{ id: "message", label: "Message" }],
    outputs: [
      { id: "response", label: "Response" },
      { id: "usage", label: "Token Usage" },
    ],
  },
  [AIFlowNodeType.AnthropicLlm]: {
    label: "Anthropic Claude",
    description: "Call Anthropic Claude models",
    category: AIFlowNodeCategory.Llm,
    defaultFields: [
      {
        key: "model",
        label: "Model",
        type: NodeFieldType.Select,
        value: "claude-3-5-sonnet-20241022",
        options: [
          { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
          { label: "Claude 3 Opus", value: "claude-3-opus-20240229" },
          { label: "Claude 3 Sonnet", value: "claude-3-sonnet-20240229" },
          { label: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
        ],
        description: "Select the Anthropic model",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: NodeFieldType.Number,
        value: 0.7,
        description: "Controls randomness",
      },
      {
        key: "max_tokens",
        label: "Max Tokens",
        type: NodeFieldType.Number,
        value: 2048,
        description: "Maximum tokens to generate",
      },
      {
        key: "system_message",
        label: "System Prompt",
        type: NodeFieldType.Textarea,
        value: "You are a helpful assistant.",
        description: "System instructions for Claude",
      },
    ],
    defaultConfig: {
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.7,
      max_tokens: 2048,
      system_message: "You are a helpful assistant.",
    },
    inputs: [{ id: "message", label: "Message" }],
    outputs: [
      { id: "response", label: "Response" },
      { id: "usage", label: "Token Usage" },
    ],
  },
  [AIFlowNodeType.ChromaRetriever]: {
    label: "Chroma Retriever",
    description: "Retrieve documents from ChromaDB",
    category: AIFlowNodeCategory.Retrieval,
    defaultFields: [
      {
        key: "collection_name",
        label: "Collection Name",
        type: NodeFieldType.Text,
        value: "default",
        required: true,
        description: "Name of the ChromaDB collection",
      },
      {
        key: "top_k",
        label: "Top K Results",
        type: NodeFieldType.Number,
        value: 5,
        description: "Number of documents to retrieve",
      },
      {
        key: "score_threshold",
        label: "Score Threshold",
        type: NodeFieldType.Number,
        value: 0.7,
        description: "Minimum similarity score (0-1)",
      },
    ],
    defaultConfig: {
      collection_name: "default",
      top_k: 5,
      score_threshold: 0.7,
    },
    inputs: [{ id: "query", label: "Query" }],
    outputs: [
      { id: "context", label: "Context" },
      { id: "source_documents", label: "Source Documents" },
    ],
  },
  [AIFlowNodeType.PineconeRetriever]: {
    label: "Pinecone Retriever",
    description: "Retrieve documents from Pinecone",
    category: AIFlowNodeCategory.Retrieval,
    defaultFields: [
      {
        key: "index_name",
        label: "Index Name",
        type: NodeFieldType.Text,
        value: "",
        required: true,
        description: "Name of the Pinecone index",
      },
      {
        key: "namespace",
        label: "Namespace",
        type: NodeFieldType.Text,
        value: "",
        description: "Optional namespace within the index",
      },
      {
        key: "top_k",
        label: "Top K Results",
        type: NodeFieldType.Number,
        value: 5,
        description: "Number of documents to retrieve",
      },
      {
        key: "score_threshold",
        label: "Score Threshold",
        type: NodeFieldType.Number,
        value: 0.7,
        description: "Minimum similarity score",
      },
    ],
    defaultConfig: {
      index_name: "",
      namespace: "",
      top_k: 5,
      score_threshold: 0.7,
    },
    inputs: [{ id: "query", label: "Query" }],
    outputs: [
      { id: "context", label: "Context" },
      { id: "source_documents", label: "Source Documents" },
    ],
  },
  [AIFlowNodeType.PythonTool]: {
    label: "Python Tool",
    description: "Execute Python code",
    category: AIFlowNodeCategory.Tools,
    defaultFields: [
      {
        key: "code",
        label: "Python Code",
        type: NodeFieldType.Textarea,
        value: '# Your Python code here\nresult = input.get("data")\n',
        required: true,
        description: "Python code to execute",
      },
      {
        key: "timeout",
        label: "Timeout (seconds)",
        type: NodeFieldType.Number,
        value: 30,
        description: "Maximum execution time",
      },
    ],
    defaultConfig: {
      code: '# Your Python code here\nresult = input.get("data")\n',
      timeout: 30,
    },
    inputs: [{ id: "variables", label: "Input Variables" }],
    outputs: [
      { id: "result", label: "Result" },
      { id: "stdout", label: "Console Output" },
    ],
  },
  [AIFlowNodeType.HttpTool]: {
    label: "HTTP Request",
    description: "Make HTTP API calls",
    category: AIFlowNodeCategory.Tools,
    defaultFields: [
      {
        key: "method",
        label: "Method",
        type: NodeFieldType.Select,
        value: "GET",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
        ],
      },
      {
        key: "url",
        label: "URL",
        type: NodeFieldType.Text,
        value: "",
        required: true,
        placeholder: "https://api.example.com/data",
      },
      {
        key: "headers",
        label: "Headers (JSON)",
        type: NodeFieldType.Textarea,
        value: '{"Content-Type": "application/json"}',
      },
      {
        key: "body",
        label: "Body (JSON)",
        type: NodeFieldType.Textarea,
        value: "",
      },
      {
        key: "timeout",
        label: "Timeout (seconds)",
        type: NodeFieldType.Number,
        value: 30,
      },
    ],
    defaultConfig: {
      method: "GET",
      url: "",
      headers: '{"Content-Type": "application/json"}',
      body: "",
      timeout: 30,
    },
    inputs: [{ id: "variables", label: "Input Variables" }],
    outputs: [
      { id: "response", label: "Response" },
      { id: "status", label: "Status Code" },
    ],
  },
  [AIFlowNodeType.TextSplitter]: {
    label: "Text Splitter",
    description: "Split text into chunks",
    category: AIFlowNodeCategory.Processing,
    defaultFields: [
      {
        key: "chunk_size",
        label: "Chunk Size",
        type: NodeFieldType.Number,
        value: 1000,
      },
      {
        key: "chunk_overlap",
        label: "Chunk Overlap",
        type: NodeFieldType.Number,
        value: 200,
      },
      {
        key: "separator",
        label: "Separator",
        type: NodeFieldType.Text,
        value: "\n\n",
      },
    ],
    defaultConfig: {
      chunk_size: 1000,
      chunk_overlap: 200,
      separator: "\n\n",
    },
    inputs: [{ id: "text", label: "Text" }],
    outputs: [{ id: "chunks", label: "Chunks" }],
  },
  [AIFlowNodeType.TextCombiner]: {
    label: "Text Combiner",
    description: "Combine multiple texts",
    category: AIFlowNodeCategory.Processing,
    defaultFields: [
      {
        key: "separator",
        label: "Separator",
        type: NodeFieldType.Text,
        value: "\n\n",
      },
      {
        key: "prefix",
        label: "Prefix",
        type: NodeFieldType.Text,
        value: "",
      },
      {
        key: "suffix",
        label: "Suffix",
        type: NodeFieldType.Text,
        value: "",
      },
      {
        key: "include_indices",
        label: "Include Indices",
        type: NodeFieldType.Toggle,
        value: false,
      },
    ],
    defaultConfig: {
      separator: "\n\n",
      prefix: "",
      suffix: "",
      include_indices: false,
    },
    inputs: [{ id: "texts", label: "Texts" }],
    outputs: [{ id: "combined_text", label: "Combined Text" }],
  },
  [AIFlowNodeType.Conditional]: {
    label: "Conditional",
    description: "Branch based on condition",
    category: AIFlowNodeCategory.Processing,
    defaultFields: [
      {
        key: "condition",
        label: "Condition",
        type: NodeFieldType.Text,
        value: 'len(input.get("text", "")) > 100',
        required: true,
      },
      {
        key: "true_output",
        label: "True Output Value",
        type: NodeFieldType.Text,
        value: "true",
      },
      {
        key: "false_output",
        label: "False Output Value",
        type: NodeFieldType.Text,
        value: "false",
      },
    ],
    defaultConfig: {
      condition: 'len(input.get("text", "")) > 100',
      true_output: "true",
      false_output: "false",
    },
    inputs: [{ id: "input", label: "Input" }],
    outputs: [{ id: "result", label: "Result" }],
  },
};

export const NODE_CATEGORIES: NodeCategoryGroup[] = [
  {
    label: "Input/Output",
    types: [AIFlowNodeType.ChatInput, AIFlowNodeType.ChatOutput],
  },
  {
    label: "LLM Models",
    types: [AIFlowNodeType.OpenAiLlm, AIFlowNodeType.AnthropicLlm],
  },
  {
    label: "Retrieval",
    types: [AIFlowNodeType.ChromaRetriever, AIFlowNodeType.PineconeRetriever],
  },
  {
    label: "Tools",
    types: [AIFlowNodeType.PythonTool, AIFlowNodeType.HttpTool],
  },
  {
    label: "Processing",
    types: [
      AIFlowNodeType.TextSplitter,
      AIFlowNodeType.TextCombiner,
      AIFlowNodeType.Conditional,
    ],
  },
];
