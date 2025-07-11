package com.example.pareto;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

@WebServlet("/generatePareto")
public class ParetoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 1. Configurar a resposta para ser do tipo JSON e codificação UTF-8
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 2. Ler os dados brutos enviados pelo corpo da requisição
        String rawData = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));

        try {
            // 3. Processar os dados
            List<ParetoItem> items = parseData(rawData);
            if (items.isEmpty()) {
                throw new IllegalArgumentException("Nenhum dado válido foi fornecido.");
            }

            // 4. Ordenar os itens (do maior para o menor)
            Collections.sort(items);

            // 5. Calcular totais e percentuais acumulados
            double totalValue = items.stream().mapToDouble(ParetoItem::getValue).sum();
            double cumulativeSum = 0;

            List<String> labels = new ArrayList<>();
            List<Double> values = new ArrayList<>();
            List<Double> cumulativePercentages = new ArrayList<>();

            for (ParetoItem item : items) {
                cumulativeSum += item.getValue();
                labels.add(item.getCause());
                values.add(item.getValue());
                cumulativePercentages.add((cumulativeSum / totalValue) * 100);
            }

            // 6. Montar o objeto de resposta
            Map<String, Object> responseData = new LinkedHashMap<>();
            responseData.put("labels", labels);
            responseData.put("values", values);
            responseData.put("cumulativePercentages", cumulativePercentages);

            // 7. Converter para JSON e enviar a resposta
            String jsonResponse = new Gson().toJson(responseData);
            PrintWriter out = response.getWriter();
            out.print(jsonResponse);
            out.flush();

        } catch (Exception e) {
            // Em caso de erro, enviar uma resposta de erro com status 400
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao processar os dados: " + e.getMessage());
            String jsonError = new Gson().toJson(errorResponse);
            PrintWriter out = response.getWriter();
            out.print(jsonError);
            out.flush();
        }
    }

    private List<ParetoItem> parseData(String rawData) {
        List<ParetoItem> items = new ArrayList<>();
        if (rawData == null || rawData.trim().isEmpty()) {
            return items;
        }

        String[] lines = rawData.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

            String[] parts = line.split(",");
            if (parts.length != 2) {
                throw new IllegalArgumentException("Formato de linha inválido: '" + line + "'. Use 'Causa, Valor'.");
            }

            String cause = parts[0].trim();
            try {
                double value = Double.parseDouble(parts[1].trim());
                if(value < 0) {
                     throw new IllegalArgumentException("O valor não pode ser negativo.");
                }
                items.add(new ParetoItem(cause, value));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Valor inválido na linha: '" + line + "'. O valor deve ser um número.");
            }
        }
        return items;
    }
}
