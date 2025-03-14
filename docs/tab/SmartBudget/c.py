with open("XRate.json","r") as fo :
    for l in fo :
        l = l.replace(",","").split();
        if len(l)>0 :
            print(l[0:1] + [ float(i) for i in l[1:] ])
