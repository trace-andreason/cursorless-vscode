import {
    createPatternMatchers,
    argumentMatcher,
    leadingMatcher,
    conditionMatcher,
    trailingMatcher,
    cascadingMatcher,
    patternMatcher,
  } from "../util/nodeMatchers";
  import {
    NodeMatcherAlternative,
    ScopeType,
    SelectionWithEditor,
  } from "../typings/Types";
  import { getNodeRange } from "../util/nodeSelectors";
  import { SyntaxNode } from "web-tree-sitter";
  
  // Generated by the following command:
  // `curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-rust/master/src/node-types.json | jq '[.[] | select(.type == "_declaration_statement" or .type == "_expression") | .subtypes[].type]'`
  const STATEMENT_TYPES = [
    "associated_type",
    "attribute_item",
    "const_item",
    "empty_statement",
    "enum_item",
    "extern_crate_declaration",
    "foreign_mod_item",
    "function_item",
    "function_signature_item",
    "impl_item",
    "inner_attribute_item",
    "let_declaration",
    "macro_definition",
    "macro_invocation",
    "mod_item",
    "static_item",
    "struct_item",
    "trait_item",
    "type_item",
    "union_item",
    "use_declaration",
    "_literal",
    "array_expression",
    "assignment_expression",
    "async_block",
    "await_expression",
    "binary_expression",
    "break_expression",
    "call_expression",
    "closure_expression",
    "compound_assignment_expr",
    "const_block",
    "continue_expression",
    "field_expression",
    "for_expression",
    "generic_function",
    "identifier",
    "if_expression",
    "if_let_expression",
    "index_expression",
    "loop_expression",
    "macro_invocation",
    "match_expression",
    "metavariable",
    "parenthesized_expression",
    "range_expression",
    "reference_expression",
    "return_expression",
    "scoped_identifier",
    "self",
    "struct_expression",
    "try_expression",
    "tuple_expression",
    "type_cast_expression",
    "unary_expression",
    "unit_expression",
    "unsafe_block",
    "while_expression",
    "while_let_expression"
  ];
  
  const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
    statement: STATEMENT_TYPES,
    string: ["raw_string_literal", "string_literal"],
    ifStatement: "if_expression",
    functionCall: ["call_expression", "macro_invocation"],
    comment: ["line_comment", "block_comment"],
    list: "array_expression",
    namedFunction: "function_item",
    type: leadingMatcher([
      "let_declaration[type]",
      "parameter[type]",
      "type_identifier",
      "generic_type.type_identifier!",
      "struct_item.type_identifier!"
    ], [":"]),
    functionName: ["function_item[name]"],
    anonymousFunction: "closure_expression",
    argumentOrParameter: cascadingMatcher(
        argumentMatcher("arguments"),
        trailingMatcher(["parameter"], [","]),
    ),
    name: [
      "let_declaration.identifier!",
      "parameter.identifier!",
    ],
    class: ["struct_item", "struct_expression"],
   };
  
  export default createPatternMatchers(nodeMatchers);