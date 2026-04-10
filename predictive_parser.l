%{
#include <stdio.h>
#include <stdlib.h>

// Function declarations
void E();
void Eprime();
void T();
void Tprime();
void F();
void error();

int lookahead;
%}

%%

// Tokens
"i"        { return 'i'; }     // id
"+"        { return '+'; }
"*"        { return '*'; }
"("        { return '('; }
")"        { return ')'; }
\n         { return '\n'; }
[ \t]      ;                   // ignore spaces

.          { return yytext[0]; }

%%

// Match function
void match(int token) {
    if (lookahead == token) {
        lookahead = yylex();
    } else {
        error();
    }
}

// Grammar rules

// E → T E'
void E() {
    T();
    Eprime();
}

// E' → + T E' | ε
void Eprime() {
    if (lookahead == '+') {
        match('+');
        T();
        Eprime();
    }
}

// T → F T'
void T() {
    F();
    Tprime();
}

// T' → * F T' | ε
void Tprime() {
    if (lookahead == '*') {
        match('*');
        F();
        Tprime();
    }
}

// F → (E) | i
void F() {
    if (lookahead == 'i') {
        match('i');
    } else if (lookahead == '(') {
        match('(');
        E();
        match(')');
    } else {
        error();
    }
}

// Error function
void error() {
    printf("String is NOT accepted\n");
    exit(0);
}

// Main function
int main() {
    printf("Enter string: ");
    lookahead = yylex();

    E();

    if (lookahead == '\n') {
        printf("String is ACCEPTED\n");
    } else {
        printf("String is NOT accepted\n");
    }

    return 0;
}
