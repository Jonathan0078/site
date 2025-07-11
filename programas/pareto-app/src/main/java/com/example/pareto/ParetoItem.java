package com.example.pareto;

// Implementa Comparable para facilitar a ordenação
public class ParetoItem implements Comparable<ParetoItem> {
    private String cause;
    private double value;

    // Construtor
    public ParetoItem(String cause, double value) {
        this.cause = cause;
        this.value = value;
    }

    // Getters
    public String getCause() {
        return cause;
    }

    public double getValue() {
        return value;
    }

    // Método para ordenação decrescente (do maior para o menor valor)
    @Override
    public int compareTo(ParetoItem other) {
        return Double.compare(other.value, this.value);
    }
}
