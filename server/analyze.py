import pandas as pd
import json
import sys
import chardet

def analyze_sales(file_path):
    # Detect encoding
    with open(file_path, 'rb') as f:
        rawdata = f.read(100000)
        result = chardet.detect(rawdata)
        enc = result['encoding'] or 'utf-8'
        print(f"Detected encoding: {enc}", file=sys.stderr)

    # Read with detected encoding
    df = pd.read_csv(file_path, encoding=enc, on_bad_lines='skip')

    # Clean column names
    df.columns = df.columns.str.strip().str.upper()

    # Find possible sales column
    possible_sales_cols = ["SALES", "TOTAL", "PRICEEACH", "AMOUNT"]
    sales_col = next((col for col in possible_sales_cols if col in df.columns), None)

    if not sales_col:
        return {"error": "No 'SALES' or similar column found.", "columns": list(df.columns)}

    # Convert sales column to numeric
    df[sales_col] = pd.to_numeric(df[sales_col], errors="coerce")
    df = df.dropna(subset=[sales_col])

    total_rows = len(df)
    total_sales = float(df[sales_col].sum())
    avg_sales = float(df[sales_col].mean())

    # Group by product line
    if "PRODUCTLINE" in df.columns:
        chart_data = (
            df.groupby("PRODUCTLINE")[sales_col]
            .sum()
            .reset_index()
            .rename(columns={sales_col: "total_sales"})
            .to_dict(orient="records")
        )
    else:
        chart_data = []

    return {
        "encoding": enc,
        "total_rows": total_rows,
        "total_sales": total_sales,
        "average_sales": avg_sales,
        "chart_data": chart_data,
    }

if __name__ == "__main__":
    try:
        file_path = sys.argv[1]
        insights = analyze_sales(file_path)
        print(json.dumps(insights))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
