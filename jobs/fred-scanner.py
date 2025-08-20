from secedgar import filings, FilingType
from itertools import islice
import time
import json




def get_stock_names():
    # Define the path to your JSON file
    file_path = './company_tickers.json' 
    
    try:
        # Open the JSON file in read mode ('r')
        with open(file_path, 'r') as file:
            # Load the JSON data from the file into a Python dictionary
            data = json.load(file)
            return list(map(lambda stock: data[stock]["ticker"], data))
    except:
        print("failed to open file")
        
def load_stock_batch(cik_list = ["aapl", "fb"]):


    # 10Q filings for Apple and Facebook (tickers "aapl" and "fb")
    filings_10k = filings(cik_lookup=list(cik_list),
                         filing_type=FilingType.FILING_10Q,
                         user_agent="Derek Nelson (contact@dereknelson.io)")
    filings_10k.save("./")

    return filings_10k

def __chunk(it, size):
    it = iter(it)
    return iter(lambda: tuple(islice(it, size)), ())

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    stock_10ks = []
    stocks = get_stock_names()
    stock_batches = __chunk(stocks, 10)
    for stock_batch in stock_batches:
        loaded_10k_batch = load_stock_batch(stock_batch)
        #stock_10ks.extend(loaded_10k_batch)
        time.sleep(1)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
